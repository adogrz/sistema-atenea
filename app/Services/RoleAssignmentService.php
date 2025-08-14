<?php

namespace App\Services;

use App\Models\User;
use App\Config\RolesConfig;
use Spatie\Permission\Models\Role;

class RoleAssignmentService
{
    /**
     * Define la jerarquía de poder de los roles a través de un rango numérico.
     * Un rol con un número más alto tiene más poder.
     */
    private const UNKNOWN_ROLE_RANK = PHP_INT_MAX;
    private function getRoleRanks(): array
    {
        return [
            'admin-ti' => 100,
            'director' => 90,
            'admin-academico' => 80,
            'jefe-psicologia' => 75,
            'jefe-medicina' => 75,
            'admin-academico-sede' => 70,
            'coordinador-area' => 60,
            'psicologo' => 50,
            'doctor' => 50,
            'mentor' => 40,
            'instructor' => 30,
            'calificador' => 20,
            'estudiante' => 10,
            'aspirante' => 5,
        ];
    }

    /**
     * Obtiene el rango jerárquico más alto de un usuario basado en sus roles.
     * Roles desconocidos se tratan como máximamente protegidos.
     */
    public function getUserRank(User $user): int
    {
        $ranks = $this->getRoleRanks();
        $userRoles = $user->roles->pluck('name')->toArray();

        $maxRank = null;

        foreach ($userRoles as $role) {
            if (!isset($ranks[$role])) {
                // Rol desconocido -> proteger
                return self::UNKNOWN_ROLE_RANK;
            }
            $maxRank = max($maxRank ?? 0, $ranks[$role]);
        }

        // Sin roles => 0
        return $maxRank ?? 0;
    }

    /**
     * Define qué roles puede asignar cada rol de usuario
     */
    private function defineRoleHierarchy(): array
    {
        return [
            'admin-ti' => [
                'assignable_roles' => [
                    'admin-ti',
                    'director',
                    'admin-academico',
                    'admin-academico-sede',
                    'coordinador-area',
                    'mentor',
                    'instructor',
                    'estudiante',
                    'aspirante',
                    'calificador'
                    // No incluye roles médicos ni psicológicos
                ],
            ],
            'director' => [
                'assignable_roles' => [], // No puede gestionar usuarios
            ],
            'admin-academico' => [
                'assignable_roles' => [
                    'admin-academico-sede',
                    'coordinador-area',
                    'mentor',
                    'instructor',
                    'estudiante',
                    'aspirante',
                    'calificador'
                    // No incluye director, admin-ti, ni roles médicos/psicológicos
                ],
            ],
            'admin-academico-sede' => [
                'assignable_roles' => [], // Solo puede ver, no asignar
            ],
            'coordinador-area' => [
                'assignable_roles' => [
                    'mentor',
                    'instructor',
                    'calificador'
                ],
            ],
            'jefe-psicologia' => [
                'assignable_roles' => ['jefe-psicologia', 'psicologo'],
            ],
            'jefe-medicina' => [
                'assignable_roles' => ['jefe-medicina', 'doctor'],
            ],
        ];
    }

    /**
     * Verifica si un usuario puede asignar un rol específico
     */
    public function canAssignRole(User $user, string $roleName): bool
    {
        // Primero verificar si tiene el permiso general para asignar roles
        if (!$user->hasPermissionTo('roles:assign')) {
            return false;
        }

        // Obtener los roles del usuario
        $userRoles = $user->roles->pluck('name')->toArray();
        $hierarchy = $this->defineRoleHierarchy();

        // Comprobar cada rol del usuario
        foreach ($userRoles as $userRole) {
            if (!isset($hierarchy[$userRole])) {
                continue;
            }

            // Si puede asignar cualquier rol
            if (
                isset($hierarchy[$userRole]['assignable_roles']) &&
                is_array($hierarchy[$userRole]['assignable_roles']) &&
                in_array('*', $hierarchy[$userRole]['assignable_roles'], true)
            ) {
                return true;
            }

            // Si el rol específico está en la lista de roles asignables
            if (in_array($roleName, $hierarchy[$userRole]['assignable_roles'], true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Obtiene todos los roles que un usuario puede asignar
     */
    public function getAssignableRoles(User $user): array
    {
        // Si no tiene el permiso general, no puede asignar ningún rol
        if (!$user->hasPermissionTo('roles:assign')) {
            return [];
        }

        $allRoles = Role::all();
        $assignableRoles = [];
        $userRoles = $user->roles->pluck('name')->toArray();
        $hierarchy = $this->defineRoleHierarchy();

        $assignableRoleNames = [];

        foreach ($userRoles as $userRole) {
            if (!isset($hierarchy[$userRole])) {
                continue;
            }

            // Si puede asignar cualquier rol
            if (
                isset($hierarchy[$userRole]['assignable_roles']) &&
                is_array($hierarchy[$userRole]['assignable_roles']) &&
                in_array('*', $hierarchy[$userRole]['assignable_roles'], true)
            ) {
                return $allRoles->toArray();
            }

            // Añadir roles asignables al conjunto
            foreach ($hierarchy[$userRole]['assignable_roles'] as $roleName) {
                $assignableRoleNames[] = $roleName;
            }
        }

        // Eliminar duplicados
        $assignableRoleNames = array_unique($assignableRoleNames);

        // Filtrar los roles
        foreach ($allRoles as $role) {
            if (in_array($role->name, $assignableRoleNames, true)) {
                $assignableRoles[] = $role;
            }
        }

        return $assignableRoles;
    }

    /**
     * Verifica si el usuario puede editar a otro usuario
     */
    public function canEditUser(User $editor, User $target): bool
    {
        // Regla 1: Un usuario no puede editarse a sí mismo.
        if ($editor->id === $target->id) {
            return false;
        }

        // Regla 2: Protección absoluta para roles críticos.
        $protectedRoles = RolesConfig::getProtectedRoles();
        if ($target->hasAnyRole($protectedRoles)) {
            return false;
        }

        // Regla 3: La lógica de edición se basa en la jerarquía de rangos.
        // Solo puedes editar usuarios con un rango estrictamente menor al tuyo.
        $editorRank = $this->getUserRank($editor);
        $targetRank = $this->getUserRank($target);

        return $editorRank > $targetRank;
    }
}

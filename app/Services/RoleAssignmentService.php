<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RoleAssignmentService
{
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
        // No puede editar usuarios que no puede ver
        $userVisibilityService = app(UserVisibilityService::class);
        $visibleUsers = $userVisibilityService->getVisibleUsers($editor);

        if (!$visibleUsers->contains('id', $target->id)) {
            return false;
        }

        // Obtener los roles del editor y del objetivo
        $editorRoles = $editor->roles->pluck('name')->toArray();
        $targetRoles = $target->roles->pluck('name')->toArray();

        // Si el editor y el objetivo comparten algún rol, no se permite la edición
        if (!empty(array_intersect($editorRoles, $targetRoles))) {
            return false;
        }

        // Admin TI no puede editar usuarios del área médica o psicológica
        if ($editor->hasRole('admin-ti')) {
            $targetRoles = $target->roles->pluck('name')->toArray();
            $restrictedRoles = ['psicologo', 'jefe-psicologia', 'doctor', 'jefe-medicina'];

            if (array_intersect($targetRoles, $restrictedRoles)) {
                return false;
            }
        }

        // Admin Académico no puede editar directores ni admin-ti
        if ($editor->hasRole('admin-academico')) {
            $targetRoles = $target->roles->pluck('name')->toArray();
            $restrictedRoles = ['director', 'admin-ti'];

            if (array_intersect($targetRoles, $restrictedRoles)) {
                return false;
            }

            // No puede gestionar usuarios del área médica o psicológica
            $medicalRoles = ['psicologo', 'jefe-psicologia', 'doctor', 'jefe-medicina'];
            if (array_intersect($targetRoles, $medicalRoles)) {
                return false;
            }
        }

        // Coordinador de área solo puede editar mentores, instructores y calificadores de su área
        if ($editor->hasRole('coordinador-area')) {
            $targetRoles = $target->roles->pluck('name')->toArray();
            $allowedRoles = ['mentor', 'instructor', 'calificador'];

            if (!array_intersect($targetRoles, $allowedRoles)) {
                return false;
            }

            // Verificar que estén en la misma área
            $editorAreaIds = $editor->areas->pluck('id')->toArray();
            $targetAreaIds = $target->areas->pluck('id')->toArray();

            if (empty(array_intersect($editorAreaIds, $targetAreaIds))) {
                return false;
            }
        }

        // Verificar si puede asignar al menos uno de los roles del usuario
        foreach ($target->roles as $role) {
            if ($this->canAssignRole($editor, $role->name)) {
                return true;
            }
        }

        return false;
    }
}

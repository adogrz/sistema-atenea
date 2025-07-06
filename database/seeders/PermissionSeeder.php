<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    private array $permissionGroups = [];

    /**
     * Define los grupos de permisos y sus respectivos permisos.
     */
    private function definePermissionGroups(): void
    {
        $this->permissionGroups = [
            'basics' => [
                'user-view-profile',
                'edit-profile',
                'change-password'
            ],
            'users' => [
                'user-list',
                'user-create',
                'user-edit',
                'user-delete',
                'user-active',
                'user-inactive',
                'user-reset-password'
            ],
            'users_visibility' => [
                'user-view-all',
                'user-view-own-sede',
                'user-view-own-area',
                'user-view-role-director',
                'user-view-role-admin-ti',
                'user-view-role-admin-academico',
                'user-view-role-admin-academico-sede',
                'user-view-role-coordinador-area',
                'user-view-role-mentor',
                'user-view-role-instructor',
                'user-view-role-estudiante',
                'user-view-role-aspirante',
                'user-view-role-calificador',
                'user-view-role-jefe-psicologia',
                'user-view-role-psicologo',
                'user-view-role-doctor-jefe',
                'user-view-role-doctor',
            ],
            'roles' => [
                'role-list',
                'role-create',
                'role-edit',
                'role-delete',
            ],
            'role_assignment' => [
                'role-assign-super-admin',
                'role-unassign-super-admin',
                'role-assign-director',
                'role-unassign-director',
                'role-assign-admin-ti',
                'role-unassign-admin-ti',
                'role-assign-admin-academico',
                'role-unassign-admin-academico',
                'role-assign-admin-academico-sede',
                'role-unassign-admin-academico-sede',
                'role-assign-coordinador-area',
                'role-unassign-coordinador-area',
                'role-assign-mentor',
                'role-unassign-mentor',
                'role-assign-instructor',
                'role-unassign-instructor',
                'role-assign-jefe-psicologia',
                'role-unassign-jefe-psicologia',
                'role-assign-psicologo',
                'role-unassign-psicologo',
                'role-assign-doctor-jefe',
                'role-unassign-doctor-jefe',
                'role-assign-doctor',
                'role-unassign-doctor',
                'role-assign-estudiante',
                'role-unassign-estudiante',
                'role-assign-aspirante',
                'role-unassign-aspirante',
                'role-assign-calificador',
                'role-unassign-calificador',
            ],
            'sedes' => [
                'sede-list',
                'sede-create',
                'sede-edit',
                'sede-delete',
                'sede-assign'
            ],
            'areas' => [
                'area-list',
                'area-create',
                'area-edit',
                'area-delete',
                'area-assign'
            ],
            'auditoria' => [
                'audit-view',
                'log-view',
                'log-export',
            ],
        ];
    }

    /**
     * Obtiene todos los permisos aplanados de los grupos definidos.
     * Esto es útil para crear los permisos en la base de datos.
     *
     * @return array<string>
     */
    private function getAllPermissionsFlattened(): array
    {
        $allPermissions = [];
        foreach ($this->permissionGroups as $group) {
            foreach ($group as $permission) {
                $allPermissions[] = $permission;
            }
        }
        return $allPermissions;
    }

    /**
     * Crea todos los permisos en la base de datos.
     * Utiliza el método getAllPermissionsFlattened para obtener todos los permisos.
     */
    private function createPermissions(): void
    {
        // Aplanar el array para crear todos los permisos
        $allPermissions = $this->getAllPermissionsFlattened();

        // Crear todos los permisos
        foreach ($allPermissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }

    /**
     * Define los roles con sus permisos y grupos de permisos.
     * Cada rol tiene un array de grupos de permisos y permisos individuales.
     *
     * @return array<string, array>
     */
    private function defineRolesWithPermissions(): array
    {
        return [
            'super-admin' => [
                'description' => 'Super Administrador',
                'groups' => [
                    'basics',
                    'users',
                    'users_visibility',
                    'roles',
                    'role_assignment',
                    'sedes',
                    'areas',
                    'auditoria'
                ],
                'permissions' => [], // Los grupos ya le dan todo.
                'exclude_permissions' => []
            ],
            'director' => [
                'description' => 'Director del programa',
                'groups' => ['basics', 'users', 'roles', 'sedes', 'areas'],
                'permissions' => ['user-view-all'], // "Visualización total del sistema"
                'can_assign_roles' => [
                    'admin-ti',
                    'admin-academico',
                    'admin-academico-sede',
                    'coordinador-area',
                    'mentor',
                    'instructor'
                ],
                'exclude_permissions' => [
                    'user-delete',
                    'user-reset-password', // Tareas técnicas para Admin TI
                    // Exclusión explícita de asignación de roles sensibles
                    'role-assign-jefe-psicologia',
                    'role-unassign-jefe-psicologia',
                    'role-assign-psicologo',
                    'role-unassign-psicologo',
                    'role-assign-doctor-jefe',
                    'role-unassign-doctor-jefe',
                    'role-assign-doctor',
                    'role-unassign-doctor',
                ]
            ],
            'admin-ti' => [
                'description' => 'Administrador de TI/Informático',
                'groups' => ['basics', 'users', 'roles', 'role_assignment', 'sedes', 'areas', 'auditoria'],
                'permissions' => ['user-view-all'], // "Administración completa del módulo de seguridad y usuarios"
                'can_assign_roles' => [
                    'director',
                    'admin-academico',
                    'admin-academico-sede',
                    'coordinador-area',
                    'mentor',
                    'instructor',
                    'estudiante',
                    'aspirante',
                    'calificador'
                ],
                'exclude_permissions' => [
                    // Exclusión explícita de asignación de roles sensibles
                    'role-assign-jefe-psicologia',
                    'role-unassign-jefe-psicologia',
                    'role-assign-psicologo',
                    'role-unassign-psicologo',
                    'role-assign-doctor-jefe',
                    'role-unassign-doctor-jefe',
                    'role-assign-doctor',
                    'role-unassign-doctor',
                ]
            ],
            'admin-academico' => [
                'description' => 'Administrador Académico',
                'groups' => ['basics', 'users', 'roles', 'sedes', 'areas'],
                'permissions' => ['user-view-all'], // Visibilidad global sobre la estructura académica
                'can_assign_roles' => [
                    'admin-academico-sede',
                    'coordinador-area',
                    'mentor',
                    'instructor'
                ],
                'exclude_permissions' => []
            ],
            'admin-academico-sede' => [
                'description' => 'Administrador Académico de Sede',
                'groups' => ['basics', 'users', 'roles'],
                'permissions' => [
                    'user-view-own-sede', // "restringido a su sede específica"
                    'user-view-role-coordinador-area',
                    'user-view-role-mentor',
                    'user-view-role-instructor',
                    'user-view-role-estudiante',
                    'user-view-role-aspirante',
                    'user-view-role-psicologo',
                    'user-view-role-doctor' // Puede ver quiénes son, pero no gestionar su data sensible
                ],
                'can_assign_roles' => [
                    'coordinador-area',
                    'mentor',
                    'instructor'
                ],
                'exclude_permissions' => ['user-view-all', 'user-view-own-area', 'user-delete', 'user-reset-password']
            ],
            'coordinador-area' => [
                'description' => 'Coordinador de Área',
                'groups' => ['basics', 'users'],
                'permissions' => [
                    'user-view-own-sede',
                    'user-view-own-area', // Restringido a su área
                    'user-view-role-mentor',
                    'user-view-role-instructor',
                    'user-view-role-estudiante',
                    'user-view-role-aspirante',
                ],
                'can_assign_roles' => ['mentor', 'instructor'],
                'exclude_permissions' => ['user-view-all', 'user-create', 'user-edit', 'user-delete', 'user-reset-password']
            ],
            'jefe-psicologia' => [
                'description' => 'Jefe de Psicología',
                'groups' => ['basics', 'users'],
                'permissions' => ['user-view-role-psicologo', 'user-view-role-estudiante'],
                'can_assign_roles' => ['psicologo'], // "Gestiona los perfiles de los demás psicólogos"
                'exclude_permissions' => ['user-view-all', 'user-create', 'user-edit', 'user-delete', 'user-reset-password']
            ],
            'psicologo' => [
                'description' => 'Psicólogo',
                'groups' => ['basics'],
                'permissions' => [], // La lógica de a qué estudiantes puede ver se manejará en la aplicación
                'can_assign_roles' => [],
                'exclude_permissions' => []
            ],
            'doctor-jefe' => [
                'description' => 'Doctor Jefe',
                'groups' => ['basics', 'users'],
                'permissions' => ['user-view-role-doctor', 'user-view-role-estudiante'],
                'can_assign_roles' => ['doctor'], // "Gestiona los perfiles de los doctores"
                'exclude_permissions' => ['user-view-all', 'user-create', 'user-edit', 'user-delete', 'user-reset-password']
            ],
            'doctor' => [
                'description' => 'Doctor',
                'groups' => ['basics'],
                'permissions' => [], // La lógica de a qué estudiantes puede ver se manejará en la aplicación
                'can_assign_roles' => [],
                'exclude_permissions' => []
            ],
            'mentor' => [
                'description' => 'Mentor',
                'groups' => ['basics'],
                'permissions' => ['user-view-role-estudiante'],
                'can_assign_roles' => [],
                'exclude_permissions' => []
            ],
            'instructor' => [
                'description' => 'Instructor',
                'groups' => ['basics'],
                'permissions' => ['user-view-role-estudiante'],
                'can_assign_roles' => [],
                'exclude_permissions' => []
            ],
            // Roles sin permisos de gestión de usuarios
            'estudiante' => [
                'description' => 'Estudiante',
                'groups' => ['basics'],
                'permissions' => [],
                'exclude_permissions' => []
            ],
            'aspirante' => [
                'description' => 'Aspirante',
                'groups' => ['basics'],
                'permissions' => [],
                'exclude_permissions' => []
            ],
            'calificador' => [
                'description' => 'Calificador',
                'groups' => ['basics'],
                'permissions' => [],
                'exclude_permissions' => []
            ],
        ];
    }

    /**
     * Obtiene los permisos a asignar para un rol específico.
     * Combina los permisos de grupos y los permisos individuales definidos en el rol.
     *
     * @param array $roleData Datos del rol que contiene grupos y permisos individuales.
     * @return array<string> Lista de permisos a asignar al rol.
     */
    private function getPermissionsForRole(array $roleData): array
    {
        $permissionsToAssign = [];

        // Asignar permisos por grupos
        if (isset($roleData['groups'])) {
            foreach ($roleData['groups'] as $groupName) {
                $permissionsToAssign = array_merge(
                    $permissionsToAssign,
                    $this->permissionGroups[$groupName]
                );
            }
        }

        // Añadir permisos individuales
        if (isset($roleData['permissions'])) {
            $permissionsToAssign = array_merge(
                $permissionsToAssign,
                $roleData['permissions']
            );
        }

        // Añadir permisos de asignación de roles basados en can_assign_roles
        if (isset($roleData['can_assign_roles'])) {
            foreach ($roleData['can_assign_roles'] as $assignableRole) {
                $permissionsToAssign[] = "role-assign-$assignableRole";
                $permissionsToAssign[] = "role-unassign-$assignableRole";
            }
        }

        // Excluir permisos específicos
        if (isset($roleData['exclude_permissions']) && is_array($roleData['exclude_permissions'])) {
            $permissionsToAssign = array_diff($permissionsToAssign, $roleData['exclude_permissions']);
        }

        return $permissionsToAssign;
    }

    /**
     * Crea los roles y asigna los permisos correspondientes.
     * Utiliza el método defineRolesWithPermissions para obtener los roles y sus permisos.
     */
    private function createRolesWithPermissions(): void
    {
        $rolesWithPermissions = $this->defineRolesWithPermissions();

        // Crear roles y asignar permisos
        foreach ($rolesWithPermissions as $roleName => $roleData) {
            $role = Role::create([
                'name' => $roleName,
                'description' => $roleData['description']
            ]);

            $permissionsToAssign = $this->getPermissionsForRole($roleData);

            // Eliminar duplicados y asignar
            $role->givePermissionTo(array_unique($permissionsToAssign));
        }
    }

    public function run(): void
    {
        // Resetear roles y permisos cacheados
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Definir grupos de permisos
        $this->definePermissionGroups();

        // Crear todos los permisos
        $this->createPermissions();

        // Crear roles y asignar permisos
        $this->createRolesWithPermissions();
    }
}

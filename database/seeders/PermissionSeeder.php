<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    private array $permissionGroups = [];

    /**
     * Define los grupos de permisos y sus respectivos permisos.
     * Cada grupo contiene un array de permisos que se asignarán a los roles.
     */
    private function definePermissionGroups(): void
    {
        $this->permissionGroups = [
            'básicos' => [
                'user-view-profile', 'edit-profile', 'change-password'
            ],
            'usuarios' => [
                'user-list', 'user-create', 'user-edit', 'user-delete', 'user-active', 'user-inactive', 'user-reset-password'
            ],
            'roles' => [
                'role-list', 'role-create', 'role-edit', 'role-delete', 'role-assign'
            ],
            'sedes' => [
                'sede-list', 'sede-create', 'sede-edit', 'sede-delete', 'sede-assign'
            ],
            'calificaciones' => [
                'grade-upload', 'grade-edit'
            ],
            'auditoría' => [
                'log-view', 'log-export'
            ]
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
            'admin' => [
                'description' => 'Administrador del sistema',
                'groups' => ['básicos', 'usuarios', 'roles', 'sedes', 'auditoría']
            ],
            'admin_academic' => [
                'description' => 'Administrador Académico',
                'groups' => ['básicos', 'usuarios', 'roles', 'sedes', 'calificaciones'],
                'exclude_permissions' => ['user-delete']
            ],
            'calificador' => [
                'description' => 'Calificador',
                'groups' => ['básicos', 'calificaciones']
            ],
            'usuario' => [
                'description' => 'Usuario',
                'groups' => ['básicos']
            ]
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

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    private array $permissionGroups = [];

    /**
     * Define los grupos de permisos y sus respectivos permisos.
     */
    private function definePermissions(): void
    {
        $this->permissionGroups = [
            'general' => [
                'profile:view',
                'profile:edit',
                'password:change'
            ],
            'users' => [
                'users:list',
                'users:create',
                'users:edit',
                'users:delete',
                'users:reset-password'
            ],
            'users-visibility' => [
                'users:view-all',        // Ver todos los usuarios
                'users:view-sede',       // Ver usuarios de su sede
                'users:view-area',       // Ver usuarios de su área
            ],
            'roles' => [
                'roles:list',
                'roles:create',
                'roles:edit',
                'roles:delete',
                'roles:assign',          // Permiso general para asignar roles
            ],
            'sedes' => [
                'sedes:list',
                'sedes:create',
                'sedes:edit',
                'sedes:delete',
                'sedes:assign'
            ],
            'areas' => [
                'areas:list',
                'areas:create',
                'areas:edit',
                'areas:delete',
                'areas:assign'
            ],
            'clinical-records' => [
                'clinical-records:view-module', // Ver el módulo de expediente clínico
            ],
            'clinical-assignments' => [
                'assignments:view-medical',
                'assignments:manage-medical', // Gestionar asignaciones de estudiantes a doctores
                'assignments:view-psychological',
                'assignments:manage-psychological', // Gestionar asignaciones de estudiantes a psicólogos
            ],
            'medical-records' => [
                'medical-records:view',         // Ver la información general y lista de consultas de un expediente
                'medical-records:create',       // Crear el expediente de un estudiante por primera vez
                'medical-records:edit',         // Editar la información general (antecedentes) de un expediente
                'medical-records:view-all',     // Permiso de supervisor para ver cualquier expediente médico
            ],
            'medical-consultations' => [
                'medical-consultations:create',     // Añadir una nueva consulta a un expediente existente
                'medical-consultations:edit-own',   // Editar una consulta que el propio doctor creó
                'medical-consultations:delete-own', // Eliminar una consulta que el propio doctor creó
                'medical-consultations:delete', // Eliminar cualquier consulta (permiso de jefe)
                'medical-consultations:generate-report', // Generar un reporte PDF del historial de consultas
            ],
            'psychological-records' => [
                'psychological-records:view',
                'psychological-records:create',
                'psychological-records:edit',
                'psychological-records:view-all',
            ],
            'psychological-sessions' => [
                'psychological-sessions:create',
                'psychological-sessions:edit-own',
                'psychological-sessions:delete-own',
                'psychological-sessions:delete', // Jefe puede eliminar cualquier sesión
                'psychological-sessions:generate-report',
            ],
            'consent-forms' => [
                'consent-forms:create',
                'consent-forms:view',
                'consent-forms:manage', // Para adjuntar/validar documentos
            ],
            'auditing' => [
                'audit:view',
                'logs:view',
                'logs:export',
                'audit:medical-view',   // Ver SOLO los logs relacionados al módulo médico
                'audit:psychological-view', // Ver SOLO los logs relacionados al módulo psicológico
            ],
            'events' => [
                'events:view',
                'events:create',
                'events:edit',
                'events:delete',
                'events:export',
            ],
            'academic' => [
                'academic:view',
                'academic:manage',
            ],
            'internado' => [
                'internado:view',
                'internado:manage',
                'internado:asistencias:view',
                'internado:conductas:view',
                'internado:evaluaciones:view',
                'internado:admin:view',  // Para selección, participantes y periodos
            ],
        ];
    }

    /**
     * Obtiene todos los permisos aplanados de los grupos definidos.
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
     */
    private function createPermissions(): void
    {
        // Aplanar el array para crear todos los permisos
        $allPermissions = $this->getAllPermissionsFlattened();

        // Crear todos los permisos (forzando guard consistente)
        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }

    /**
     * Define los roles con sus permisos y grupos de permisos.
     *
     * @return array<string, array>
     */
    private function defineRolesWithPermissions(): array
    {
        return [
            'director' => [
                'description' => 'Director del programa',
                'groups' => ['general', 'auditing'],
                'permissions' => ['users:view-all', 'users:list', 'roles:list', 'sedes:list', 'areas:list'],
                'inherits' => [],
                'exclude_permissions' => ['users:create', 'users:edit', 'users:delete', 'users:reset-password']
            ],
            'admin-ti' => [
                'description' => 'Administrador de TI',
                'groups' => ['general', 'users', 'roles', 'sedes', 'areas', 'auditing'],
                'permissions' => ['users:view-all', 'roles:assign'],
                'inherits' => [],
                'exclude_permissions' => []
            ],
            'admin-academico' => [
                'description' => 'Administrador Académico',
                'groups' => ['general', 'users', 'sedes', 'areas', 'events', 'academic', 'internado'],
                'permissions' => ['users:view-all', 'roles:list', 'roles:assign'],
                'inherits' => [],
                'exclude_permissions' => []
            ],
            'admin-academico-sede' => [
                'description' => 'Administrador Académico de Sede',
                'groups' => ['general', 'academic'],
                'permissions' => [
                    'users:view-sede',
                    'users:list',
                    'roles:list',
                    'sedes:list',
                    'areas:list',
                    'events:view'
                ],
                'inherits' => [],
                'exclude_permissions' => ['events:delete', 'events:edit', 'events:create']
            ],
            'coordinador-area' => [
                'description' => 'Coordinador de Área',
                'groups' => ['general'],
                'permissions' => [
                    'users:view-sede',
                    'users:view-area',
                    'users:list',
                    'users:create',
                    'users:edit',
                    'roles:assign'
                ],
                'inherits' => [],
                'exclude_permissions' => []
            ],
            'psicologo' => [
                'description' => 'Psicólogo',
                'groups' => ['general', 'psychological-sessions'],
                'permissions' => [
                    'users:view-sede',
                    'users:list',
                    'clinical-records:view-module',
                    'assignments:view-psychological',
                    // Permisos para expedientes psicológicos
                    'psychological-records:view',
                    'psychological-records:create',
                    // Permisos básicos de consentimiento informado
                    'consent-forms:create',
                    'consent-forms:view',
                ],
                'inherits' => [],
                'exclude_permissions' => [
                    // Por seguridad no puede borrar sesiones por defecto (ni propias ni de otros)
                    'psychological-sessions:delete-own',
                    'psychological-sessions:delete'
                ]
            ],
            'jefe-psicologia' => [
                'description' => 'Jefe de Psicología',
                'groups' => [],
                'permissions' => [
                    'users:create',
                    'users:edit',
                    'roles:assign',
                    'assignments:manage-psychological',
                    'psychological-records:view-all', // Puede ver todos los expedientes
                    'psychological-records:edit',     // Puede editar la info general de cualquier expediente
                    'psychological-sessions:delete-own', // Anula la exclusión heredada
                    'psychological-sessions:delete',     // Puede borrar cualquier sesión (no solo las propias)
                    'consent-forms:manage',           // Puede gestionar los documentos adjuntos
                    'audit:psychological-view'
                ],
                'inherits' => ['psicologo'],
                'exclude_permissions' => []
            ],
            'doctor' => [
                'description' => 'Doctor',
                'groups' => ['general', 'medical-consultations'],
                'permissions' => [
                    'users:view-sede',
                    'users:list',
                    'clinical-records:view-module',
                    'assignments:view-medical',
                    // Permisos para expedientes médicos
                    'medical-records:view',
                    'medical-records:create',
                    // Permisos para consultas médicas
                    'medical-consultations:delete-own', // Puede eliminar sus propias consultas
                    // Permisos básicos de consentimiento informado
                    'consent-forms:create',
                    'consent-forms:view',
                ],
                'inherits' => [],
                'exclude_permissions' => [
                    // Por seguridad no puede borrar consultas de otros doctores
                    'medical-consultations:delete'
                ]
            ],
            'jefe-medicina' => [
                'description' => 'Jefe de Medicina',
                'groups' => [],
                'permissions' => [
                    'users:create',
                    'users:edit',
                    'roles:assign',
                    'assignments:manage-medical',
                    'medical-records:view-all',
                    'medical-records:edit',
                    'medical-consultations:delete-own', // Anula la exclusión heredada
                    'medical-consultations:delete',     // Puede borrar cualquier consulta
                    'consent-forms:manage',           // Puede gestionar los documentos adjuntos
                    'audit:medical-view'
                ],
                'inherits' => ['doctor'],
                'exclude_permissions' => []
            ],
            'mentor' => [
                'description' => 'Mentor',
                'groups' => ['general'],
                'permissions' => ['users:view-sede', 'users:view-area', 'users:list'],
                'inherits' => [],
                'exclude_permissions' => []
            ],
            'instructor' => [
                'description' => 'Instructor',
                'groups' => ['general'],
                'permissions' => ['users:view-sede', 'users:view-area', 'users:list'],
                'inherits' => [],
                'exclude_permissions' => []
            ],
            'calificador' => [
                'description' => 'Calificador',
                'groups' => ['general'],
                'permissions' => [
                    'users:view-sede', 
                    'users:view-area', 
                    'users:list',
                    'internado:asistencias:view',
                    'internado:conductas:view',
                    'internado:evaluaciones:view',
                ],
                'inherits' => [],
                'exclude_permissions' => []
            ],
            'estudiante' => [
                'description' => 'Estudiante',
                'groups' => ['general'],
                'permissions' => [],
                'inherits' => [],
                'exclude_permissions' => []
            ],
            'aspirante' => [
                'description' => 'Aspirante',
                'groups' => ['general'],
                'permissions' => [],
                'inherits' => [],
                'exclude_permissions' => []
            ],
        ];
    }

    /**
     * Obtiene los permisos a asignar para un rol específico.
     *
     * @param array $roleData Datos del rol.
     * @return array<string> Lista de permisos a asignar al rol.
     */
    private function getPermissionsForRole(array $roleData): array
    {
        $permissionsToAssign = [];

        // Aplicar herencia primero
        if (isset($roleData['inherits']) && is_array($roleData['inherits'])) {
            $rolesWithPermissions = $this->defineRolesWithPermissions();
            foreach ($roleData['inherits'] as $parentRole) {
                if (isset($rolesWithPermissions[$parentRole])) {
                    $inheritedPermissions = $this->getPermissionsForRole($rolesWithPermissions[$parentRole]);
                    $permissionsToAssign = [
                        ...$permissionsToAssign,
                        ...$inheritedPermissions
                    ];
                }
            }
        }

        // Asignar permisos por grupos
        if (isset($roleData['groups'])) {
            foreach ($roleData['groups'] as $groupName) {
                if (isset($this->permissionGroups[$groupName])) {
                    $permissionsToAssign = [
                        ...$permissionsToAssign,
                        ...$this->permissionGroups[$groupName]
                    ];
                }
            }
        }

        // Añadir permisos individuales
        if (isset($roleData['permissions'])) {
            $permissionsToAssign = array_merge($permissionsToAssign, $roleData['permissions']);
        }

        // Excluir permisos específicos
        if (isset($roleData['exclude_permissions']) && is_array($roleData['exclude_permissions'])) {
            $permissionsToAssign = array_diff($permissionsToAssign, $roleData['exclude_permissions']);
        }

        return array_unique($permissionsToAssign);
    }

    /**
     * Crea los roles y asigna los permisos correspondientes.
     */
    private function createRolesWithPermissions(): void
    {
        $rolesWithPermissions = $this->defineRolesWithPermissions();

        // Crear roles y asignar permisos
        foreach ($rolesWithPermissions as $roleName => $roleData) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'web',
            ], [
                'description' => $roleData['description'],
            ]);

            $permissionsToAssign = $this->getPermissionsForRole($roleData);

            $role->syncPermissions($permissionsToAssign);
        }
    }

    public function run(): void
    {
        // Resetear roles y permisos cacheados
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Definir grupos de permisos
        $this->definePermissions();

        // Crear todos los permisos
        $this->createPermissions();

        // Crear roles y asignar permisos
        $this->createRolesWithPermissions();
    }
}

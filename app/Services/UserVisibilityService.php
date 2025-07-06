<?php

namespace App\Services;

use App\Models\User;

class UserVisibilityService
{
    /**
     * Obtiene los usuarios visibles para un usuario específico
     * aplicando filtros por rol, sede y área académica
     */
    public function getVisibleUsers(User $user): \Illuminate\Database\Eloquent\Collection
    {
        // Si tiene permiso para ver todos los usuarios
        if ($user->hasPermissionTo('user-view-all')) {
            return User::with('roles', 'sede', 'areas')->get();
        }

        // Iniciar consulta base
        $query = User::query();

        // Filtrar por roles visibles
        $viewableRoles = $this->getViewableRoles($user);
        if (!empty($viewableRoles)) {
            $query->whereHas('roles', function ($q) use ($viewableRoles) {
                $q->whereIn('name', $viewableRoles);
            });
        }

        // Filtrar por sede si tiene restricción de sede
        if ($user->hasPermissionTo('user-view-own-sede') && $user->sede_name) {
            $query->where('sede_name', $user->sede_name);
        }

        // Filtrar por área si tiene restricción de área
        if ($user->hasPermissionTo('user-view-own-area')) {
            $userAreaIds = $user->areas->pluck('id')->toArray();
            if (!empty($userAreaIds)) {
                $query->whereHas('areas', function ($q) use ($userAreaIds) {
                    $q->whereIn('areas.id', $userAreaIds);
                });
            }
        }

        // Incluir siempre al usuario actual en los resultados
        $query->orWhere('id', $user->id);

        return $query->with('roles', 'sede', 'areas')->get();
    }

    /**
     * Obtiene los nombres de roles que un usuario puede ver
     */
    private function getViewableRoles(User $user): array
    {
        $viewableRoles = [];

        // Obtener todos los permisos que empiezan con 'user-view-role-'
        $viewPermissions = $user->getPermissionsViaRoles()
            ->filter(function ($permission) {
                return strpos($permission->name, 'user-view-role-') === 0;
            });

        // Extraer el nombre del rol de cada permiso
        foreach ($viewPermissions as $permission) {
            $roleName = str_replace('user-view-role-', '', $permission->name);
            $viewableRoles[] = $roleName;
        }

        return $viewableRoles;
    }
}

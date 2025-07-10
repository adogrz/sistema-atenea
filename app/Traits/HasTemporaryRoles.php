<?php

namespace App\Traits;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Spatie\Permission\Models\Role;

trait HasTemporaryRoles
{
    /**
     * Obtiene todos los roles incluyendo los expirados
     */
    public function getAllRolesWithExpired(): MorphToMany
    {
        return $this->morphToMany(
            config('permission.models.role'),
            'model',
            config('permission.table_names.model_has_roles'),
            config('permission.column_names.model_morph_key'),
            'role_id'
        )->withPivot('is_primary', 'expires_at');
    }

    /**
     * Filtra los roles no expirados de la colección de roles actual
     */
    public function getNonExpiredRoles()
    {
        $now = Carbon::now();
        return $this->roles->filter(function ($role) use ($now) {
            return !$role->pivot->expires_at || $now < Carbon::parse($role->pivot->expires_at);
        });
    }

    /**
     * Sincroniza roles preservando información temporal y de rol primario.
     * Este método es más eficiente y seguro que `detach` seguido de `attach` en un bucle.
     */
    public function syncRolesWithExpiration(array $roles): self
    {
        $rolesToSync = [];
        $primaryRoleName = null;

        // Encontrar el rol primario definido en el input
        foreach ($roles as $role) {
            if (!empty($role['is_primary'])) {
                $primaryRoleName = $role['name'];
                break;
            }
        }

        // Preparar los datos para la sincronización
        foreach ($roles as $role) {
            $roleModel = Role::findByName($role['name'], $this->getDefaultGuardName());
            $rolesToSync[$roleModel->id] = [
                'expires_at' => !empty($role['expires_at']) ? Carbon::parse($role['expires_at']) : null,
                'is_primary' => $roleModel->name === $primaryRoleName,
            ];
        }

        $this->roles()->sync($rolesToSync);
        $this->load('roles'); // Recargar la relación de roles

        return $this;
    }

    /**
     * Obtiene el rol primario del usuario
     */
    public function getPrimaryRole(): ?Role
    {
        return $this->roles()->wherePivot('is_primary', true)->first();
    }

    /**
     * Limpia roles expirados
     */
    public function clearExpiredRoles(): void
    {
        $now = Carbon::now();

        $expiredRoleIds = $this->getAllRolesWithExpired()
            ->wherePivot('expires_at', '<=', $now)
            ->whereNotNull('expires_at')
            ->pluck('id')
            ->toArray();

        if (!empty($expiredRoleIds)) {
            $this->roles()->detach($expiredRoleIds);
            $this->load('roles');
        }
    }
}

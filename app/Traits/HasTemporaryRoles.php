<?php

namespace App\Traits;

use Carbon\Carbon;
use Spatie\Permission\Models\Role;

trait HasTemporaryRoles
{
    /**
     * Obtiene todos los roles incluyendo los expirados
     */
    public function getAllRolesWithExpired()
    {
        return $this->morphToMany(
            config('permission.models.role'),
            'model',
            config('permission.table_names.model_has_roles'),
            config('permission.column_names.model_morph_key'),
            'role_id'
        );
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
     * Asigna un rol temporal
     */
    public function assignTemporaryRole(string $roleName, ?Carbon $expiresAt = null, bool $isPrimary = false): self
    {
        $role = app(config('permission.models.role'))->findByName($roleName, $this->getDefaultGuardName());

        // Si ya tiene el rol, actualizar el pivot
        if ($this->hasRole($role)) {
            $this->roles()->updateExistingPivot($role->id, [
                'expires_at' => $expiresAt,
                'is_primary' => $isPrimary,
            ]);
            return $this;
        }

        // Si es rol primario, quitar primario de otros roles
        if ($isPrimary) {
            $this->roles()->update(['is_primary' => false]);
        }

        // Asignar el rol con expiración
        $this->roles()->attach($role->id, [
            'expires_at' => $expiresAt,
            'is_primary' => $isPrimary,
        ]);

        $this->load('roles');

        return $this;
    }

    /**
     * Sincroniza roles preservando información temporal
     */
    public function syncRolesWithExpiration(array $roles): self
    {
        // Desasignar todos los roles
        $this->roles()->detach();

        // Reasignar con expiración
        foreach ($roles as $role) {
            $roleName = is_string($role) ? $role : $role['name'];
            $expiresAt = !empty($role['expires_at'])
                ? Carbon::parse($role['expires_at'])
                : null;
            $isPrimary = isset($role['is_primary']) && $role['is_primary'];

            $this->assignTemporaryRole($roleName, $expiresAt, $isPrimary);
        }

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

        // Obtener IDs de roles expirados
        $expiredRoleIds = $this->getAllRolesWithExpired()
            ->wherePivot('expires_at', '<=', $now)
            ->whereNotNull('expires_at')
            ->pluck('id')
            ->toArray();

        if (!empty($expiredRoleIds)) {
            // Eliminar roles expirados
            $this->roles()->detach($expiredRoleIds);
            $this->load('roles');
        }
    }
}

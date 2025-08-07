<?php

namespace App\Services;

use App\Models\User;

class UserDeletionService
{
    /**
     * Determina si un usuario puede eliminar a otro.
     */
    public function canDelete(User $deleter, User $target): bool
    {
        // Regla 1: Un usuario no puede eliminarse a sí mismo.
        if ($deleter->id === $target->id) {
            return false;
        }

        // Regla 2: Reglas específicas para el rol 'admin-ti'.
        if ($deleter->hasRole('admin-ti')) {
            // Un admin-ti no puede eliminar a otro admin-ti.
            if ($target->hasRole('admin-ti')) {
                return false;
            }

            // Un admin-ti no puede eliminar a jefes de área clave.
            if ($target->hasAnyRole(['jefe-medicina', 'jefe-psicologia'])) {
                return false;
            }
        }

        // Regla final: Verificar el permiso general de eliminación.
        return $deleter->hasPermissionTo('users:delete');
    }
}

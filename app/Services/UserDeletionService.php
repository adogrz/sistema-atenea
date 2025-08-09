<?php

namespace App\Services;

use App\Models\User;
use App\Config\RolesConfig;

class UserDeletionService
{
    protected RoleAssignmentService $roleAssignmentService;

    public function __construct(RoleAssignmentService $roleAssignmentService)
    {
        $this->roleAssignmentService = $roleAssignmentService;
    }

    /**
     * Determina si un usuario puede eliminar a otro, basándose en permisos y la jerarquía de rangos.
     */
    public function canDelete(User $deleter, User $target): bool
    {
        // Regla 1: Un usuario no puede eliminarse a sí mismo.
        if ($deleter->id === $target->id) {
            return false;
        }

        // Regla 2: Protección absoluta para roles críticos.
        $protectedRoles = RolesConfig::getProtectedRoles();
        if ($target->hasAnyRole($protectedRoles)) {
            return false;
        }

        // Regla 3: Verificar si el eliminador tiene el permiso general para eliminar.
        if (!$deleter->hasPermissionTo('users:delete')) {
            return false;
        }

        // Regla 4: La eliminación se basa en la jerarquía de rangos.
        // Solo puedes eliminar usuarios con un rango estrictamente menor al tuyo.
        $deleterRank = $this->roleAssignmentService->getUserRank($deleter);
        $targetRank = $this->roleAssignmentService->getUserRank($target);

        return $deleterRank > $targetRank;
    }
}

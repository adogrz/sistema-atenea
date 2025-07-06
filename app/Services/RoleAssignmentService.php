<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RoleAssignmentService
{
    /**
     * Verifica si un usuario puede asignar un rol específico
     */
    public function canAssignRole(User $user, string $roleName): bool
    {
        return $user->hasPermissionTo("role-assign-$roleName");
    }

    /**
     * Obtiene todos los roles que un usuario puede asignar
     */
    public function getAssignableRoles(User $user): array
    {
        $allRoles = Role::all();
        $assignableRoles = [];

        foreach ($allRoles as $role) {
            if ($this->canAssignRole($user, $role->name)) {
                $assignableRoles[] = $role;
            }
        }

        return $assignableRoles;
    }

    /**
     * Verifica si el usuario puede editar a otro usuario
     * basado en los roles que puede ver y asignar,
     * considerando restricciones de sede y área
     */
    public function canEditUser(User $editor, User $target): bool
    {
        // No puede editar usuarios que no puede ver
        $userVisibilityService = app(UserVisibilityService::class);
        $visibleUsers = $userVisibilityService->getVisibleUsers($editor);

        if (!$visibleUsers->contains('id', $target->id)) {
            return false;
        }

        // Verificar restricción por sede
        if ($editor->hasPermissionTo('user-view-own-sede') &&
            $editor->sede_name !== $target->sede_name) {
            return false;
        }

        // Verificar restricción por área
        if ($editor->hasPermissionTo('user-view-own-area')) {
            $editorAreaIds = $editor->areas->pluck('id')->toArray();
            $targetAreaIds = $target->areas->pluck('id')->toArray();

            // Verificar si hay al menos un área en común
            if (empty(array_intersect($editorAreaIds, $targetAreaIds))) {
                return false;
            }
        }

        // Verificar si puede editar al menos uno de los roles del usuario
        foreach ($target->roles as $role) {
            if ($this->canAssignRole($editor, $role->name)) {
                return true;
            }
        }

        return false;
    }
}

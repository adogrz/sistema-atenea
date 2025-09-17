<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    /**
     * Verificar si el usuario puede gestionar cualquier asignación.
     */
    private function canManageAny(User $user): bool
    {
        return $user->can('assignments:manage-medical') || $user->can('assignments:manage-psychological');
    }

    /**
     * Verificar si el usuario puede gestionar una asignación específica.
     */
    private function canManage(User $user, Assignment $assignment): bool
    {
        $hasPermission = match ($assignment->type) {
            Assignment::TYPE_MEDICAL => $user->can('assignments:manage-medical'),
            Assignment::TYPE_PSYCHOLOGICAL => $user->can('assignments:manage-psychological'),
            default => false,
        };

        // Verificar que el profesional pertenezca a la misma sede
        $sameSede = $user->sede_name === $assignment->professional->sede_name;

        return $hasPermission && $sameSede;
    }

    /**
     * Ver cualquier asignación.
     */
    public function viewAny(User $user): bool
    {
        return $this->canManageAny($user);
    }

    /**
     * Ver una asignación específica.
     */
    public function view(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Crear nueva asignación.
     */
    public function create(User $user): bool
    {
        return $this->canManageAny($user);
    }

    /**
     * Actualizar asignación existente.
     */
    public function update(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Assignment $assignment): bool
    {
        return false;
    }
}

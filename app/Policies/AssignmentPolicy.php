<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    /**
     * Verificar si el usuario puede gestionar cualquier tipo de asignación.
     * 
     * @param User $user
     * @return bool
     */
    private function canManageAny(User $user): bool
    {
        return $user->can('assignments:manage-medical') || $user->can('assignments:manage-psychological');
    }

    /**
     * Verificar si el usuario puede gestionar una asignación específica.
     * Valida tanto el permiso por tipo como la sede del profesional.
     * 
     * @param User $user
     * @param Assignment $assignment
     * @return bool
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
     * Determinar si el usuario puede ver la lista de asignaciones.
     */
    public function viewAny(User $user): bool
    {
        return $this->canManageAny($user);
    }

    /**
     * Determinar si el usuario puede ver una asignación específica.
     */
    public function view(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Determinar si el usuario puede crear asignaciones.
     */
    public function create(User $user): bool
    {
        return $this->canManageAny($user);
    }

    /**
     * Determinar si el usuario puede actualizar una asignación.
     */
    public function update(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Determinar si el usuario puede eliminar (soft delete) una asignación.
     */
    public function delete(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Determinar si el usuario puede restaurar una asignación eliminada.
     */
    public function restore(User $user, Assignment $assignment): bool
    {
        return $this->canManage($user, $assignment);
    }

    /**
     * Determinar si el usuario puede eliminar permanentemente una asignación.
     * Bloqueado para preservar historial médico.
     */
    public function forceDelete(User $user, Assignment $assignment): bool
    {
        return false; // Nadie puede eliminar permanentemente asignaciones
    }
}

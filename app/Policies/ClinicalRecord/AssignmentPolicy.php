<?php

namespace App\Policies\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    /**
     * Verificar si el usuario puede gestionar un tipo específico de asignación.
     */
    private function canManageType(User $user, string $type): bool
    {
        return match ($type) {
            Assignment::TYPE_MEDICAL => $user->can('assignments:manage-medical'),
            Assignment::TYPE_PSYCHOLOGICAL => $user->can('assignments:manage-psychological'),
            default => false,
        };
    }

    /**
     * Verificar si el usuario pertenece a la misma sede que el profesional.
     */
    private function isSameSede(User $user, User $professional): bool
    {
        // Si el usuario no tiene sede asignada, puede ver todas (caso admin)
        if (!$user->sede_name) {
            return true;
        }

        return $user->sede_name === $professional->sede_name;
    }

    /**
     * Verificar si el usuario es el profesional asignado (para doctores/psicólogos).
     */
    private function isAssignedProfessional(User $user, Assignment $assignment): bool
    {
        return $user->id === $assignment->professional_id;
    }

    /**
     * Determinar si el usuario puede ver la lista de asignaciones.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('assignments:manage-medical')
            || $user->can('assignments:manage-psychological')
            || $user->can('medical-records:view')
            || $user->can('psychological-records:view');
    }

    /**
     * Determinar si el usuario puede ver una asignación específica.
     */
    public function view(User $user, Assignment $assignment): bool
    {
        // Si es jefe, verificar tipo y sede
        if ($this->canManageType($user, $assignment->type)) {
            return $this->isSameSede($user, $assignment->professional);
        }

        // Si es doctor/psicólogo, solo puede ver sus propias asignaciones
        return $this->isAssignedProfessional($user, $assignment);
    }

    /**
     * Determinar si el usuario puede crear asignaciones.
     * Solo jefes pueden crear asignaciones.
     */
    public function create(User $user): bool
    {
        return $user->can('assignments:manage-medical')
            || $user->can('assignments:manage-psychological');
    }

    /**
     * Determinar si el usuario puede actualizar una asignación.
     * Solo jefes pueden actualizar.
     */
    public function update(User $user, Assignment $assignment): bool
    {
        if (!$this->canManageType($user, $assignment->type)) {
            return false;
        }

        return $this->isSameSede($user, $assignment->professional);
    }

    /**
     * Determinar si el usuario puede eliminar una asignación.
     * Solo jefes pueden eliminar.
     */
    public function delete(User $user, Assignment $assignment): bool
    {
        return $this->update($user, $assignment);
    }

    /**
     * Determinar si el usuario puede restaurar una asignación eliminada.
     */
    public function restore(User $user, Assignment $assignment): bool
    {
        return $this->update($user, $assignment);
    }

    /**
     * Determinar si el usuario puede eliminar permanentemente una asignación.
     */
    public function forceDelete(User $user, Assignment $assignment): bool
    {
        return false; // Preservar historial médico
    }
}

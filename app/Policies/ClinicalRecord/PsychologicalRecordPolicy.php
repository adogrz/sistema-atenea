<?php

namespace App\Policies\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\PsychologicalRecord;
use App\Models\User;

class PsychologicalRecordPolicy
{
    /**
     * Determina si el usuario puede ver la lista de expedientes psicológicos.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('psychological-records:view') || $user->can('psychological-records:view-all');
    }

    /**
     * Determina si el usuario puede ver un expediente psicológico específico.
     */
    public function view(User $user, PsychologicalRecord $psychologicalRecord): bool
    {
        // 1. Regla para Supervisores (Jefe de Psicología)
        // Si el usuario tiene el permiso de "ver todo", se le permite el acceso.
        if ($user->can('psychological-records:view-all')) {
            // Si el supervisor no tiene una sede (ej. un admin), puede ver todo.
            if (!$user->sede_name) {
                return true;
            }
            // El supervisor puede ver el expediente si el estudiante pertenece a su misma sede.
            // El estudiante tiene una relación con User, y el User tiene sede_name.
            $studentSede = $psychologicalRecord->student->user->sede_name ?? null;
            return $user->sede_name === $studentSede;
        }

        // 2. Regla para Profesionales (Psicólogo)
        // Si el usuario tiene el permiso básico de vista, verificamos la asignación.
        if ($user->can('psychological-records:view')) {
            // Un psicólogo puede ver el expediente si existe una asignación psicológica
            // activa que vincule a este psicólogo con el estudiante del expediente.
            return Assignment::where('student_nie', $psychologicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'psychological')
                ->where('is_active', true)
                ->exists();
        }

        // Si no se cumple ninguna de las condiciones, el acceso es denegado.
        return false;
    }

    /**
     * Determina si el usuario puede crear un expediente psicológico.
     */
    public function create(User $user): bool
    {
        return $user->can('psychological-records:create');
    }

    /**
     * Determina si el usuario puede actualizar un expediente psicológico.
     */
    public function update(User $user, PsychologicalRecord $psychologicalRecord): bool
    {
        if ($user->can('psychological-records:edit')) {
            if (!$user->sede_name) {
                return true; // Admin puede editar cualquier expediente.
            }
            // El estudiante tiene una relación con User, y el User tiene sede_name.
            $studentSede = $psychologicalRecord->student->user->sede_name ?? null;
            return $user->sede_name === $studentSede;
        }

        return false;
    }

    /**
     * Determina si el usuario puede eliminar (soft delete) un expediente.
     */
    public function delete(User $user, PsychologicalRecord $psychologicalRecord): bool
    {
        // Los expedientes psicológicos no deben ser eliminables a través del flujo normal de la aplicación.
        return false;
    }

    /**
     * Determina si el usuario puede restaurar un expediente.
     */
    public function restore(User $user, PsychologicalRecord $psychologicalRecord): bool
    {
        return $user->hasRole('admin-ti');
    }

    /**
     * Determina si el usuario puede eliminar permanentemente un expediente.
     */
    public function forceDelete(User $user, PsychologicalRecord $psychologicalRecord): bool
    {
        // Esta acción está restringida.
        return false;
    }
}

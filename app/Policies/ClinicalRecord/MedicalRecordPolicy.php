<?php

namespace App\Policies\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\MedicalRecord;
use App\Models\User;

class MedicalRecordPolicy
{
    /**
     * Determina si el usuario puede ver la lista de expedientes médicos.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('medical-records:view') || $user->can('medical-records:view-all');
    }

    /**
     * Determina si el usuario puede ver un expediente médico específico.
     */
    public function view(User $user, MedicalRecord $medicalRecord): bool
    {
        // 1. Regla para Supervisores (Jefe de Medicina)
        // Si el usuario tiene el permiso de "ver todo", se le permite el acceso.
        if ($user->can('medical-records:view-all')) {
            // Si el supervisor no tiene una sede (ej. un admin), puede ver todo.
            if (!$user->sede_name) {
                return true;
            }
            // El supervisor puede ver el expediente si el estudiante pertenece a su misma sede.
            // El estudiante tiene una relación con User, y el User tiene sede_name.
            $studentSede = $medicalRecord->student->user->sede_name ?? null;
            return $user->sede_name === $studentSede;
        }

        // 2. Regla para Profesionales (Doctor)
        // Si el usuario tiene el permiso básico de vista, verificamos la asignación.
        if ($user->can('medical-records:view')) {
            // Un doctor puede ver el expediente si existe una asignación médica
            // activa que vincule a este doctor con el estudiante del expediente.
            return Assignment::where('student_nie', $medicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'medical')
                ->where('is_active', true)
                ->exists();
        }

        // Si no se cumple ninguna de las condiciones, el acceso es denegado.
        return false;
    }

    /**
     * Determina si el usuario puede crear un expediente médico.
     */
    public function create(User $user): bool
    {
        return $user->can('medical-records:create');
    }

    /**
     * Determina si el usuario puede actualizar un expediente médico.
     */
    public function update(User $user, MedicalRecord $medicalRecord): bool
    {
        if ($user->can('medical-records:edit')) {
            if (!$user->sede_name) {
                return true; // Admin puede editar cualquier expediente.
            }
            // El estudiante tiene una relación con User, y el User tiene sede_name.
            $studentSede = $medicalRecord->student->user->sede_name ?? null;
            return $user->sede_name === $studentSede;
        }

        return false;
    }

    /**
     * Determina si el usuario puede eliminar (soft delete) un expediente.
     */
    public function delete(User $user, MedicalRecord $medicalRecord): bool
    {
        // Los expedientes médicos no deben ser eliminables a través del flujo normal de la aplicación.
        return false;
    }

    /**
     * Determina si el usuario puede restaurar un expediente.
     */
    public function restore(User $user, MedicalRecord $medicalRecord): bool
    {
        return $user->hasRole('admin-ti');
    }

    /**
     * Determina si el usuario puede eliminar permanentemente un expediente.
     */
    public function forceDelete(User $user, MedicalRecord $medicalRecord): bool
    {
        // Esta acción está restringida.
        return false;
    }
}

<?php

namespace App\Policies\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\User;

class MedicalConsultationPolicy
{
    /**
     * Determine whether the user can view any models.
     * Las consultas siempre se ven en el contexto de un expediente médico.
     * Para ver consultas, el usuario debe poder ver el expediente.
     */
    public function viewAny(User $user): bool
    {
        // Puede ver consultas si puede ver expedientes médicos
        return $user->can('medical-records:view') || $user->can('medical-records:view-all');
    }

    /**
     * Determine whether the user can view the model.
     * Las consultas se ven en el contexto del expediente, no individualmente.
     */
    public function view(User $user, MedicalConsultation $medicalConsultation): bool
    {
        // Jefes pueden ver cualquier consulta de su sede
        if ($user->can('medical-records:view-all')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $medicalConsultation->medicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // Doctores pueden ver consultas de sus estudiantes asignados
        if ($user->can('medical-records:view')) {
            return Assignment::where('student_nie', $medicalConsultation->medicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'medical')
                ->where('is_active', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     * Solo doctores con permiso explícito pueden crear consultas.
     */
    public function create(User $user): bool
    {
        return $user->can('medical-consultations:create');
    }

    /**
     * Determine whether the user can update the model.
     * Dos casos:
     * 1. Jefe de Medicina puede editar CUALQUIER consulta en su sede
     * 2. Doctor solo puede editar sus PROPIAS consultas (con asignación activa)
     */
    public function update(User $user, MedicalConsultation $medicalConsultation): bool
    {
        // Caso 1: Jefe de Medicina puede editar CUALQUIER consulta en su sede
        if ($user->can('medical-records:edit')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $medicalConsultation->medicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // Caso 2: Doctor solo puede editar sus PROPIAS consultas
        if ($user->can('medical-consultations:edit-own')) {
            // Check 2.1: Propiedad
            if ($medicalConsultation->doctor_id !== $user->id) {
                return false;
            }
            // Check 2.2: Asignación activa
            return Assignment::where('student_nie', $medicalConsultation->medicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'medical')
                ->where('is_active', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     * Dos casos:
     * 1. Jefe con permiso 'medical-consultations:delete' puede eliminar cualquier consulta de su sede
     * 2. Doctor con permiso 'medical-consultations:delete-own' solo puede eliminar sus propias consultas
     */
    public function delete(User $user, MedicalConsultation $medicalConsultation): bool
    {
        // Caso 1: Jefe puede eliminar cualquier consulta de su sede
        if ($user->can('medical-consultations:delete')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $medicalConsultation->medicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // Caso 2: Doctor solo puede eliminar sus propias consultas
        if ($user->can('medical-consultations:delete-own')) {
            // Solo puede eliminar sus propias consultas
            if ($medicalConsultation->doctor_id !== $user->id) {
                return false;
            }

            // Debe tener asignación activa con el estudiante
            return Assignment::where('student_nie', $medicalConsultation->medicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'medical')
                ->where('is_active', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     * Permitir que el mismo usuario que eliminó pueda restaurar (deshacer),
     * además de los administradores y jefes.
     */
    public function restore(User $user, MedicalConsultation $medicalConsultation): bool
    {
        // Admin TI siempre puede restaurar
        if ($user->hasRole('admin-ti')) {
            return true;
        }

        // Jefe puede restaurar cualquier consulta de su sede
        if ($user->can('medical-consultations:delete')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $medicalConsultation->medicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // El doctor que creó la consulta puede restaurarla (deshacer)
        if ($user->can('medical-consultations:delete-own')) {
            return $medicalConsultation->doctor_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Las consultas médicas NO deben ser eliminadas permanentemente por razones de auditoría.
     */
    public function forceDelete(User $user, MedicalConsultation $medicalConsultation): bool
    {
        return false; // Nunca permitir eliminación permanente
    }
}

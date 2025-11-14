<?php

namespace App\Policies\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\PsychologicalSession;
use App\Models\User;

class PsychologicalSessionPolicy
{
    /**
     * Determine whether the user can view any models.
     * Las sesiones siempre se ven en el contexto de un expediente psicológico.
     * Para ver sesiones, el usuario debe poder ver el expediente.
     */
    public function viewAny(User $user): bool
    {
        // Puede ver sesiones si puede ver expedientes psicológicos
        return $user->can('psychological-records:view') || $user->can('psychological-records:view-all');
    }

    /**
     * Determine whether the user can view the model.
     * Las sesiones se ven en el contexto del expediente, no individualmente.
     */
    public function view(User $user, PsychologicalSession $psychologicalSession): bool
    {
        // Jefes pueden ver cualquier sesión de su sede
        if ($user->can('psychological-records:view-all')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $psychologicalSession->psychologicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // Psicólogos pueden ver sesiones de sus estudiantes asignados
        if ($user->can('psychological-records:view')) {
            return Assignment::where('student_nie', $psychologicalSession->psychologicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'psychological')
                ->where('is_active', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     * Solo psicólogos con permiso explícito pueden crear sesiones.
     */
    public function create(User $user): bool
    {
        return $user->can('psychological-sessions:create');
    }

    /**
     * Determine whether the user can update the model.
     * Dos casos:
     * 1. Jefe de Psicología puede editar CUALQUIER sesión en su sede
     * 2. Psicólogo solo puede editar sus PROPIAS sesiones (con asignación activa)
     */
    public function update(User $user, PsychologicalSession $psychologicalSession): bool
    {
        // Caso 1: Jefe de Psicología puede editar CUALQUIER sesión en su sede
        if ($user->can('psychological-records:edit')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $psychologicalSession->psychologicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // Caso 2: Psicólogo solo puede editar sus PROPIAS sesiones
        if ($user->can('psychological-sessions:edit-own')) {
            // Check 2.1: Propiedad
            if ($psychologicalSession->psychologist_id !== $user->id) {
                return false;
            }
            // Check 2.2: Asignación activa
            return Assignment::where('student_nie', $psychologicalSession->psychologicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'psychological')
                ->where('is_active', true)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     * Dos casos:
     * 1. Jefe con permiso 'psychological-sessions:delete' puede eliminar cualquier sesión de su sede
     * 2. Psicólogo con permiso 'psychological-sessions:delete-own' solo puede eliminar sus propias sesiones
     */
    public function delete(User $user, PsychologicalSession $psychologicalSession): bool
    {
        // Caso 1: Jefe puede eliminar cualquier sesión de su sede
        if ($user->can('psychological-sessions:delete')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $psychologicalSession->psychologicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // Caso 2: Psicólogo solo puede eliminar sus propias sesiones
        if ($user->can('psychological-sessions:delete-own')) {
            // Solo puede eliminar sus propias sesiones
            if ($psychologicalSession->psychologist_id !== $user->id) {
                return false;
            }

            // Debe tener asignación activa con el estudiante
            return Assignment::where('student_nie', $psychologicalSession->psychologicalRecord->student_nie)
                ->where('professional_id', $user->id)
                ->where('type', 'psychological')
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
    public function restore(User $user, PsychologicalSession $psychologicalSession): bool
    {
        // Admin TI siempre puede restaurar
        if ($user->hasRole('admin-ti')) {
            return true;
        }

        // Jefe puede restaurar cualquier sesión de su sede
        if ($user->can('psychological-sessions:delete')) {
            if (!$user->sede_name) {
                return true; // Admin sin sede
            }

            $studentUser = $psychologicalSession->psychologicalRecord->student->user ?? null;
            return $studentUser && $user->sede_name === $studentUser->sede_name;
        }

        // El psicólogo que creó la sesión puede restaurarla (deshacer)
        if ($user->can('psychological-sessions:delete-own')) {
            return $psychologicalSession->psychologist_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     * Las sesiones psicológicas NO deben ser eliminadas permanentemente por razones de auditoría.
     */
    public function forceDelete(User $user, PsychologicalSession $psychologicalSession): bool
    {
        return false; // Nunca permitir eliminación permanente
    }
}

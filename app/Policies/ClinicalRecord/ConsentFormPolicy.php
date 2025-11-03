<?php

namespace App\Policies\ClinicalRecord;

use App\Models\ClinicalRecord\ConsentForm;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ConsentFormPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ConsentForm $consentForm): bool
    {
        // Permiso general para ver consentimientos
        if (!$user->can('consent-forms:view')) {
            return false;
        }

        // Si el usuario puede ver todos, permitir
        if ($user->can('medical-records:view-all')) {
            return true;
        }

        // Si el usuario es el profesional que registró el consentimiento
        if ($consentForm->professional_id === $user->id) {
            return true;
        }

        // Si el usuario está asignado a la misma sede y coincide el estudiante (heurística simple)
        // Nota: para reglas más finas, se debería validar asignaciones explícitas.
        if ($user->sede_name && optional($consentForm->student)->sede_name === $user->sede_name) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('consent-forms:create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ConsentForm $consentForm): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ConsentForm $consentForm): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ConsentForm $consentForm): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ConsentForm $consentForm): bool
    {
        return false;
    }
}

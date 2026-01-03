<?php

namespace App\Policies;

use App\Models\User;
use App\Models\FaseOlimpiada;
use Illuminate\Auth\Access\HandlesAuthorization;

class FaseOlimpiadaPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\FaseOlimpiada  $faseOlimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, FaseOlimpiada $faseOlimpiada)
    {
        return $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->hasPermissionTo('fases:create') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\FaseOlimpiada  $faseOlimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, FaseOlimpiada $faseOlimpiada)
    {
        return $user->hasPermissionTo('fases:edit') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\FaseOlimpiada  $faseOlimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, FaseOlimpiada $faseOlimpiada)
    {
        return $user->hasPermissionTo('fases:delete') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can reorder phases.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function reorder(User $user)
    {
        return $user->hasPermissionTo('fases:reorder') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can assign minimum grade to a phase.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\FaseOlimpiada  $faseOlimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function assignNotaMinima(User $user, FaseOlimpiada $faseOlimpiada)
    {
        return $user->hasRole('admin-academico');
    }
}

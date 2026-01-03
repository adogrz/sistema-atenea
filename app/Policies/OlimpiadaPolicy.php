<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Olimpiada;
use Illuminate\Auth\Access\HandlesAuthorization;

class OlimpiadaPolicy
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
     * @param  \App\Models\Olimpiada  $olimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Olimpiada $olimpiada)
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
        return $user->hasPermissionTo('olimpiadas:create') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Olimpiada  $olimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Olimpiada $olimpiada)
    {
        return $user->hasPermissionTo('olimpiadas:edit') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Olimpiada  $olimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Olimpiada $olimpiada)
    {
        return $user->hasPermissionTo('olimpiadas:delete') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Olimpiada  $olimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function restore(User $user, Olimpiada $olimpiada)
    {
        return $user->hasPermissionTo('olimpiadas:delete') && $user->hasRole('admin-academico');
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Olimpiada  $olimpiada
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function forceDelete(User $user, Olimpiada $olimpiada)
    {
        return $user->hasPermissionTo('olimpiadas:delete') && $user->hasRole('admin-academico');
    }
}
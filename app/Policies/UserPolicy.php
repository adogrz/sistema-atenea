<?php

namespace App\Policies;

use App\Models\User;
use App\Services\RoleAssignmentService;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determina si el usuario puede ver la lista de usuarios.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user-list');
    }

    /**
     * Determina si el usuario puede crear nuevos usuarios.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user-create');
    }

    /**
     * Determina si el usuario puede actualizar un usuario específico.
     */
    public function update(User $user, User $model): bool
    {
        // Un usuario no puede editarse a sí mismo a través de este formulario.
        if ($user->id === $model->id) {
            return false;
        }

        // Reutilizamos la lógica compleja que ya tenías en tu servicio.
        $roleAssignmentService = app(RoleAssignmentService::class);
        return $user->hasPermissionTo('user-edit') && $roleAssignmentService->canEditUser($user, $model);
    }

    /**
     * Determina si el usuario puede eliminar un usuario específico.
     */
    public function delete(User $user, User $model): bool
    {
        // Un usuario no puede eliminarse a sí mismo.
        if ($user->id === $model->id) {
            return false;
        }

        return $user->hasPermissionTo('user-delete');
    }

    /**
     * Determina si el usuario puede restaurar un usuario eliminado.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->hasPermissionTo('user-restore');
    }

    /**
     * Determina si el usuario puede enviar un enlace de reseteo de contraseña.
     */
    public function sendResetLink(User $user, User $model): bool
    {
        return $user->hasPermissionTo('user-reset-password');
    }
}

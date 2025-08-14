<?php

namespace App\Policies;

use App\Models\User;
use App\Services\RoleAssignmentService;
use App\Services\UserDeletionService;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determina si el usuario puede ver la lista de usuarios.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('users:list');
    }

    /**
     * Determina si el usuario puede crear nuevos usuarios.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('users:create');
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

        // Reutilizamos la lógica compleja de nuestro servicio.
        $roleAssignmentService = app(RoleAssignmentService::class);
        return $user->hasPermissionTo('users:edit') && $roleAssignmentService->canEditUser($user, $model);
    }

    /**
     * Determina si el usuario puede eliminar un usuario específico.
     */
    public function delete(User $user, User $model): bool
    {
        // Delegamos toda la lógica compleja a nuestro servicio.
        return app(UserDeletionService::class)->canDelete($user, $model);
    }

    /**
     * Determina si el usuario puede restaurar un usuario eliminado.
     */
    public function restore(User $user, User $model): bool
    {
        // Reutiliza la misma lógica de jerarquía que delete
        return app(UserDeletionService::class)->canDelete($user, $model);
    }

    /**
     * Determina si el usuario puede enviar un enlace de reseteo de contraseña a otro usuario.
     */
    public function sendResetLink(User $user, User $model): bool
    {
        if (!$user->hasPermissionTo('users:reset-password')) {
            return false;
        }

        // Evitar accionar sobre roles protegidos o superiores
        $roleAssignmentService = app(RoleAssignmentService::class);

        // Puedes relajar esta regla si así lo prefieres
        return $roleAssignmentService->getUserRank($user) > $roleAssignmentService->getUserRank($model);
    }
}

<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserVisibilityService
{
    /**
     * Obtiene los usuarios visibles para un usuario específico
     */
    public function getVisibleUsers(User $user): Collection
    {
        // Si tiene permiso para ver todos los usuarios
        if ($user->hasPermissionTo('users:view-all')) {
            return User::with(['sede', 'areas'])->get();
        }

        // Iniciar consulta base
        $query = User::query();

        // Filtrar por sede si tiene restricción de sede
        if ($user->sede_name && $user->hasPermissionTo('users:view-sede')) {
            $query->where('sede_name', $user->sede_name);
        }

        // Filtrar por área si tiene restricción de área
        if ($user->hasPermissionTo('users:view-area')) {
            $userAreaIds = $user->areas->pluck('id')->toArray();
            if (!empty($userAreaIds)) {
                $query->whereHas('areas', function ($q) use ($userAreaIds) {
                    $q->whereIn('areas.id', $userAreaIds);
                });
            }
        }

        // Incluir siempre al usuario actual en los resultados
        $query->orWhere('id', $user->id);

        return $query->get();
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Password;


class UserController extends Controller
{
    /**
     * Retrieves all users with their roles and locations, and renders the user listing page.
     *
     * Returns an Inertia response with a collection of users, each including id, name, email, role description, location description, and status.
     */
    public function index()
    {
        $users = User::with('role', 'sede')->get();

        return Inertia::render('Usuarios/Index', [
            'users' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role_name' => $u->role->description ?? $u->role_name,
                'sede_name' => $u->sede->description ?? $u->sede_name,
                'status' => $u->status,
            ])
        ]);
    }

    /**
     * Updates the specified user's details, including name, email, status, role, and location.
     *
     * Validates the incoming request data, ensures the authenticated user is present, updates the user's attributes and role, and logs the update event with old and new values.
     *
     * @return \Illuminate\Http\RedirectResponse Redirects back with a success or error message.
     */
    public function update(Request $request, User $user)
    {
        // Verifica que el usuario autenticado sea válido
        $userAuth = $request->user();

        if (!$userAuth) {
            return back()->withErrors(['error' => 'Sesión caducada o no autenticado.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'status' => 'required|in:active,inactive',
            'sede_name' => 'required|string|exists:sedes,name',
            'role_name' => 'required|string|exists:roles,name',
        ]);

        $original = $user->only(['name', 'email', 'status', 'sede_name', 'role_name']);

        // Actualiza rol y demás atributos
        $user->assignRole($validated['role_name']);
        $user->update($validated);

        $changes = $user->only(['name', 'email', 'status', 'sede_name', 'role_name']);

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($userAuth)
            ->withProperties([
                'event' => 'Actualizar',
                'old' => $original,
                'attributes' => $changes,
            ])
            ->event('updated')
            ->log('Usuario actualizado');

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Soft deletes a user unless the authenticated user is attempting to delete their own account or the user is already deleted.
     *
     * Prevents self-deletion and redundant deletion attempts. Logs the deletion event with relevant user attributes before performing the soft delete.
     *
     * @return \Illuminate\Http\RedirectResponse Redirects back with a success or error message.
     */
    public function destroy(Request $request, User $user)
    {
        $userAuth = $request->user();

        if ($user->id === $userAuth->id) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta.']);
        }

        if ($user->trashed()) {
            return back()->withErrors(['error' => 'Este usuario ya está eliminado.']);
        }

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($userAuth)
            ->withProperties([
                'event' => 'Eliminar',
                'attributes' => $user->only(['name', 'email', 'role_name', 'sede_name']),
            ])
            ->event('deleted')
            ->log('Eliminar Usuario');

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    /**
     * Restores a previously soft-deleted user by ID.
     *
     * @param int $id The ID of the user to restore.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore(Request $request, $id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user())
            ->withProperties([
                'event' => 'Restaurar',
                'attributes' => $user->only(['name', 'email', 'role_name', 'sede_name']),
            ])
            ->event('restored')
            ->log('Usuario restaurado');

        return back()->with('success', 'Usuario restaurado.');
    }

    /**
     * Sends a password reset link to the specified user's email address.
     *
     * If the reset link is sent successfully, logs the event and returns with a success message; otherwise, returns with validation errors.
     */
    public function sendResetLink(Request $request, User $user)
    {
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            activity('usuarios')
                ->performedOn($user)
                ->causedBy($request->user())
                ->event('envio-recuperacion-contraseña')
                ->log("Se envió enlace de recuperación de contraseña");

            return back()->with('success', 'Se envió el enlace de recuperación.');
        } else {
            return back()->withErrors(['email' => __($status)]);
        }
    }
}

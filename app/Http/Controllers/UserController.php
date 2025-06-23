<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Models\User;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('role', 'sede')->get();

        return Inertia::render('Usuarios/Index', [
            'users' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->description ?? $u->role_name,
                'sede' => $u->sede->description ?? $u->sede_name,
                'status' => $u->status,
            ])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {   
        $userAuth = $request->user();

        if (!$userAuth) {
            return back()->withErrors(['error' => 'Sesión caducada o no autenticado.']);
        }

        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'status' => 'in:activo,inactivo',
            'sede_name' => 'required|string|exists:sedes,name',
            'role_name' => 'required|string|exists:roles,name',
        ]);

        $user->assignRole($request->role_name);
        $user->update($data);

        activity()
            ->performedOn($user)
            ->causedBy($userAuth)
            ->log('Usuario actualizado');

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        $userAuth = $request->user();
        if ($user->id === $userAuth->id) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta.']);
        }

        activity()
            ->performedOn($user)
            ->causedBy($userAuth)
            ->log('Usuario eliminado');

        $user->delete(); // Soft delete

        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    /**
     * Restore a soft-deleted user.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function restore(Request $request, $id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        activity()
            ->performedOn($user)
            ->causedBy($request->user())
            ->log('Usuario restaurado');

        return back()->with('success', 'Usuario restaurado.');
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use App\Models\Sede;

class RegisteredUserController extends Controller
{
    /**
     * Displays the user registration form with available roles and sedes.
     *
     * Retrieves all roles and sedes from the database, mapping each to an array with `value` and `label` keys, and passes them to the registration view.
     *
     * @return \Inertia\Response
     */
    public function create(): Response
    {
        $roles = Role::select('name', 'description')
            ->get()
            ->map(fn ($role) => [
                'value' => $role->name,
                'label' => $role->description,
            ])
            ->toArray();

        $sedes = Sede::select('name', 'description')
            ->get()
            ->map(fn ($sede) => [
                'value' => $sede->name,
                'label' => $sede->description,
            ])
            ->toArray();

        return Inertia::render('auth/register', [
            'roles' => $roles,
            'sedes' => $sedes,
        ]);
    }

    /**
     * Handles registration of a new user with role and sede assignment.
     *
     * Validates the registration data, creates a new user with the specified role and sede, assigns the role, fires a registration event, and logs the activity. Redirects to the users dashboard after successful registration.
     *
     * @param Request $request The incoming registration request containing user details.
     * @return RedirectResponse Redirects to the users dashboard upon successful registration.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_name' => 'required|exists:roles,name',
            'sede_name' => 'required|exists:sedes,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_name' => $request->role_name,
            'sede_name' => $request->sede_name,
        ]);

        $user->assignRole($request->role_name);

        event(new Registered($user));

        // Registro en el activity log
        activity('usuarios')
            ->performedOn($user)
            ->causedBy($request->user()) // puede ser null si no está autenticado
            ->withProperties([
                'event' => 'Crear',
                'attributes' => $user->only(['name', 'email', 'role_name', 'sede_name']),
            ])
            ->event('created')
            ->log('Usuario registrado');

        //Auth::login($user); // Descomentarlo si se quiere login automático

        return redirect()->intended(route('dashboard.usuarios', absolute: false));
    }
}
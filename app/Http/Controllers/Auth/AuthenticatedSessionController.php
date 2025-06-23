<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;


class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Authenticates a user and logs their login activity, then redirects based on user role.
     *
     * After successful authentication and session regeneration, logs a "login" event with user, IP address, and user agent details. Redirects admins to the 'dashboard' route and other users to 'usuario.dashboard'.
     *
     * @return RedirectResponse Redirects the authenticated user to the appropriate dashboard based on their role.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = \App\Models\User::where('email', $request->email)->first();

        activity('acceso')
            ->performedOn($user)
            ->causedBy($user)
            ->withProperties([
                'event' => 'Iniciar sesión',
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ])
            ->event('login')
            ->log('Inició de sesión');

        // Redirección basada en rol
        if ($request->user()->hasRole('admin')) {
            return redirect()->intended(route('dashboard', absolute: false));
        } else {
            return redirect()->intended(route('usuario.dashboard', absolute: false));
        }
    }

    /**
     * Logs out the current user, invalidates the session, regenerates the CSRF token, and redirects to the login page.
     *
     * @return RedirectResponse Redirects the user to the login route after logout.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}

<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Updates the authenticated user's password after validating the current password and new password requirements.
     *
     * Logs an activity event recording the password reset, including user, IP address, and user agent details.
     *
     * @param Request $request The HTTP request containing the current and new password data.
     * @return RedirectResponse Redirects back to the previous page after updating the password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        activity('reinicio_password')
                    ->performedOn($request->user())
                    ->causedBy($request->user())
                    ->withProperties([
                        'event' => 'reinicio-contraseña',
                        'ip' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ])
                    ->event('Reinicio de contraseña')
                    ->log('Contraseña reseteada por el usuario');
        return back();
    }
}

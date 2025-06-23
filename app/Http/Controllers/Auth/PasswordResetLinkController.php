<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Processes a password reset link request by validating the email and sending a reset link if applicable.
     *
     * Validates the provided email address and attempts to send a password reset link to it. Always responds with a status message indicating that a reset link has been sent, regardless of whether the email exists in the system.
     *
     * @throws \Illuminate\Validation\ValidationException If the email is missing or invalid.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::sendResetLink(
            $request->only('email')
        );

        return back()->with('status', __('Un enlace de reinicio de contraseña ha sido enviado a su correo electrónico.'));
    }
}

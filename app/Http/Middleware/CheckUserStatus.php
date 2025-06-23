<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Intercepts the request to ensure the authenticated user has an 'active' status.
     *
     * If the user is authenticated but their status is not 'active', logs them out and redirects to the login page with an error message. Otherwise, allows the request to proceed.
     *
     * @param \Illuminate\Http\Request $request The incoming HTTP request.
     * @param \Closure $next The next middleware or request handler.
     * @return \Symfony\Component\HttpFoundation\Response The HTTP response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->status !== 'active') {
            Auth::logout();
            return redirect()->route('login')->withErrors([
                'email' => 'Tu cuenta está deshabilitada.',
            ]);
        }

        return $next($request);
    }
}
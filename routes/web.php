<?php

use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

Route::get('/', static function () {
    // Si el usuario está autenticado, siempre redirigir al dashboard principal.
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    // Si no, redirigir al login.
    return redirect()->route('login');
})->name('home');

// Rutas para usuarios autenticados
Route::middleware(['check.status', 'auth', 'verified'])->group(function () {
    // Dashboard principal
    Route::get('/dashboard', static function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/dashboard/audit', static function () {
        // Solo usuarios con permiso pueden ver esto.
        if (!auth()->user()->hasPermissionTo('audit:view')) {
            abort(403);
        }
        $logs = Activity::with('causer')->latest()->get();
        return Inertia::render('dashboard-audit', [
            'logs' => $logs,
        ]);
    })->name('dashboard.audit')->middleware('permission:audit:view');

    // Rutas para gestión de usuarios
    Route::prefix('dashboard')->group(function () {
        Route::resource('users', UserController::class)->except(['show'])->middleware([
            'index' => 'permission:users:list',
            'create' => 'permission:users:create',
            'store' => 'permission:users:create',
            'edit' => 'permission:users:edit',
            'update' => 'permission:users:edit',
            'destroy' => 'permission:users:delete',
        ]);
    });

    Route::post('/users/{user}/send-reset-link', [UserController::class, 'sendResetLink'])
        ->name('users.send-reset-link')
        ->middleware('permission:users:reset-password');

    // Ruta para depurar un usuario específico
    Route::get('/users/{user}/debug', [UserController::class, 'debug'])
        ->name('users.debug')
        ->middleware('permission:users:view-all');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Sede;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->hasRole('admin')) {
            return redirect()->route('dashboard');
        } else {
            return redirect()->route('usuario.dashboard');
        }
    }

    return redirect()->route('login');
})->name('home');

// Rutas para usuarios autenticados
Route::middleware(['check.status','auth', 'verified'])->group(function () {
    // Panel para usuarios normales
    Route::get('/home', function () {
        return Inertia::render('home', [
            'auth' => [
                'user' => Auth::user()->load('roles', 'sede', 'role')
            ]
        ]);
    })->name('usuario.dashboard');
});

// Rutas solo para administradores
Route::middleware(['check.status','auth', 'verified', 'role:admin'])->group(function () {
    // Dashboard admin
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', UserController::class)->except(['create', 'edit']);

    Route::post('/users/{user}/send-reset-link', [UserController::class, 'sendResetLink'])
    ->name('users.send-reset-link');

    Route::get('/dashboard/usuarios', function () {
        $users = User::all();
        $roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
            ];
        });

        $sedes = Sede::all()->map(function ($sede) {
            return [
                'id' => $sede->id,
                'name' => $sede->name,
                'description' => $sede->description,
            ];
        });

        return Inertia::render('dashboard_usuarios', [
            'users' => $users,
            'roles' => $roles,
            'sedes' => $sedes,
        ]);
    })->name('dashboard.usuarios');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

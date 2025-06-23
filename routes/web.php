<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Sede;
use Spatie\Permission\Models\Role;

// Ruta pública accesible para todos
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Rutas para usuarios autenticados
Route::middleware(['auth', 'verified'])->group(function () {
    // Panel para usuarios normales
    Route::get('/home', function () {
        return Inertia::render('home');
    })->name('usuario.dashboard');
});


// Rutas solo para administradores
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    // Dashboard admin
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', UserController::class)->except(['create', 'edit']);

    Route::get('/dashboard/usuarios', function () {
        $users = User::with(['role', 'sede'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_name' => $user->role->description ?? 'Sin rol',
                    'sede_name' => $user->sede->description ?? 'Sin sede',
                    'status' => $user->status,
                ];
            });
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
    })->name('dashboard_usuarios');

    Route::get('/dashboard/auditoria', function () {
        return Inertia::render('dashboard_auditoria');
    })->name('dashboard_auditorias');

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

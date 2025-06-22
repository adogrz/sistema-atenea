<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use App\Models\User;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/dashboard/usuarios', function () {
        return Inertia::render('dashboard_usuarios');
    })->name('dashboard_usuarios');

    Route::get('/dashboard/auditoria', function () {
        return Inertia::render('dashboard_auditoria');
    })->name('dashboard_auditorias');
});

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
    return Inertia::render('dashboard_usuarios', [
        'users' => $users,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard.usuarios');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

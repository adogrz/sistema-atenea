<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Collection;

use App\Models\User;
use App\Models\Sede;
use App\Models\Departamento;
use App\Models\Municipio;
use App\Models\Distrito;
use Spatie\Permission\Models\Role;

use App\Http\Controllers\UserController;
use App\Http\Controllers\CentroEducativoController;

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

Route::middleware(['web'])->group(function () {

    // Página que contiene el formulario de carga
    Route::get('/centros/importar', [CentroEducativoController::class, 'create'])->name('centros.create');

    // Ruta POST que procesa el archivo Excel
    Route::post('/centros', [CentroEducativoController::class, 'store'])->name('centros.store');
    
    // Página que contiene el formulario de admisión
    Route::get('/formulario-admision', function () {
        $departamentos = Departamento::select('id', 'nombre_departamento')->get()
            ->map(fn($d) => [
                'id' => (string) $d->id,
                'nombre_departamento' => $d->nombre_departamento,
            ]);

        $municipios = Municipio::select('id', 'nombre_municipio', 'id_departamento')->get();
        $municipiosPorDepartamento = $municipios->groupBy('id_departamento')->map(function (Collection $items) {
            return $items->map(fn($m) => [
                'id' => (string) $m->id,
                'nombre_municipio' => $m->nombre_municipio,
            ]);
        });

        $distritos = Distrito::select('id', 'nombre_distrito', 'id_municipio')->get();
        $distritosPorMunicipio = $distritos->groupBy('id_municipio')->map(function (Collection $items) {
            return $items->map(fn($d) => [
                'id' => (string) $d->id,
                'nombre_distrito' => $d->nombre_distrito,
            ]);
        });

        return Inertia::render('admission/admission-register', [
            'departamentos' => $departamentos,
            'municipiosPorDepartamento' => $municipiosPorDepartamento,
            'distritosPorMunicipio' => $distritosPorMunicipio,
        ]);
    })->name('admission');
});

// Rutas para usuarios autenticados
Route::middleware(['check.status', 'auth', 'verified'])->group(function () {
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
Route::middleware(['check.status', 'auth', 'verified', 'role:admin'])->group(function () {
    // Dashboard admin
    Route::get('/dashboard', function () {
        $logs = Activity::with('causer')->latest()->get();
        return Inertia::render('dashboard', [
            'logs' => $logs,
        ]);
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

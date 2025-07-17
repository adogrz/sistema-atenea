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
use App\Models\CentroEducativo;
use Spatie\Permission\Models\Role;

use App\Http\Controllers\UserController;
use App\Http\Controllers\CentroEducativoController;
use App\Http\Controllers\AdmisionController;

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
            'centrosEducativos' => CentroEducativo::all(),
        ]);
    })->name('admission');

    // Ruta POST que procesa el formulario de admision
    Route::post('/admision', [AdmisionController::class, 'store'])->name('admission.store');
});

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
        Route::get('users', [UserController::class, 'index'])->name('users.index')->middleware('permission:users:list');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create')->middleware('permission:users:create');
        Route::post('users', [UserController::class, 'store'])->name('users.store')->middleware('permission:users:create');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit')->middleware('permission:users:edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:users:edit');
        Route::patch('users/{user}', [UserController::class, 'update'])->middleware('permission:users:edit');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:users:delete');
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

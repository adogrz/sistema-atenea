<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Collection;

use App\Models\Departamento;
use App\Models\Municipio;
use App\Models\Distrito;
use App\Models\CentroEducativo;

use App\Http\Controllers\UserController;
use App\Http\Controllers\CentroEducativoController;
use App\Http\Controllers\AdmisionController;



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

Route::get('/dashboard/academico', function () {
    // Datos de ejemplo para mostrar en la vista
    $sampleEvents = [
        [
            'id' => 1,
            'name' => 'Registro de Aspirantes 2025',
            'type' => 'registro-aspirantes',
            'start_date' => '2025-01-15',
            'end_date' => '2025-01-30',
            'start_time' => '09:00',
            'end_time' => '17:00',
            'description' => 'Periodo de registro para nuevos aspirantes',
            'location' => 'Campus Principal',
            'status' => 'activo',
            'created_at' => '2025-01-01 10:00:00',
        ],
        [
            'id' => 2,
            'name' => 'Academia Sabatina',
            'type' => 'academia-sabatina',
            'start_date' => '2025-02-01',
            'end_date' => '2025-02-28',
            'start_time' => '08:00',
            'end_time' => '12:00',
            'description' => 'Clases de fin de semana',
            'location' => 'Aula 101',
            'status' => 'activo',
            'created_at' => '2025-01-02 14:30:00',
        ],
        [
            'id' => 3,
            'name' => 'Examen Final FDTC',
            'type' => 'examen',
            'start_date' => '2025-03-15',
            'end_date' => '2025-03-15',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'description' => 'Examen final del programa FDTC',
            'location' => 'Auditorio Principal',
            'status' => 'inactivo',
            'created_at' => '2025-01-03 16:45:00',
        ],
        [
            'id' => 4,
            'name' => 'Graduación 2025',
            'type' => 'graduacion',
            'start_date' => '2025-04-20',
            'end_date' => '2025-04-20',
            'start_time' => '18:00',
            'end_time' => '21:00',
            'description' => 'Ceremonia de graduación',
            'location' => 'Teatro Municipal',
            'status' => 'completado',
            'created_at' => '2025-01-04 12:15:00',
        ],
    ];

    return Inertia::render('dashboard-academico', [
        'events' => $sampleEvents,
    ]);
})->name('dashboard_academico');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

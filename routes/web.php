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
use App\Models\Evento;
use App\Http\Controllers\EventController;



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
        
    // Rutas para gestión de eventos académicos
    Route::post('/dashboard/academic-forms', [EventController::class, 'store'])
        ->name('academic-forms.store');

    Route::put('/dashboard/academic-forms/{event}', [EventController::class, 'update'])
        ->name('academic-forms.update');

    Route::delete('/dashboard/academic-forms/{event}', [EventController::class, 'destroy'])
        ->name('academic-forms.destroy');

    Route::get('/dashboard/academic-forms/create-event', function () {
    return Inertia::render('academic-forms/create-event');
})->name('academic-forms.create-event');

    Route::get('/dashboard/academic-forms/{event}/edit', function (Evento $event) {
        $mappedEvent = [
            'id' => $event->id,
            'name' => $event->nombre,
            'type' => $event->clasificacion,
            'start_date' => $event->fecha_inicio,
            'end_date' => $event->fecha_fin,
            'start_time' => $event->hora_inicio,
            'end_time' => $event->hora_fin,
            'description' => $event->descripcion,
            'location' => $event->ubicacion,
            'status' => $event->estado,
            'created_at' => $event->created_at,
            'updated_at' => $event->updated_at,
        ];

        return Inertia::render('academic-forms/edit-event', [ // ← NUEVO ARCHIVO
            'event' => $mappedEvent,
        ]);
    })->name('academic-forms.edit');

    // Dashboard académico
    Route::get('/dashboard/academico', function () {
        $events = Evento::orderBy('created_at', 'desc')->get()->map(function ($evento) {
            return [
                'id' => $evento->id,
                'nombre' => $evento->nombre,
                'clasificacion' => $evento->clasificacion,
                'fecha_inicio' => $evento->fecha_inicio,
                'fecha_fin' => $evento->fecha_fin,
                'hora_inicio' => $evento->hora_inicio,
                'hora_fin' => $evento->hora_fin,
                'descripcion' => $evento->descripcion,
                'ubicacion' => $evento->ubicacion,
                'estado' => $evento->estado,
                'created_at' => $evento->created_at,
                'updated_at' => $evento->updated_at,
            ];
        });
        
        return Inertia::render('dashboard-academico', [
            'events' => $events,
        ]);
    })->name('dashboard_academico');
});



Route::middleware(['web', 'check.event.period:registro-aspirantes'])->group(function () {

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

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

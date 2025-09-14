<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\UserController;
use App\Http\Controllers\CentroEducativoController;
use App\Http\Controllers\AdmisionController;
use App\Models\Evento;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CalificacionOlimpiadaController;
use App\Http\Controllers\FaseOlimpiadaController;
use App\Http\Controllers\InscripcionOlimpiadaController;
use App\Http\Controllers\OlimpiadaController;

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

    // Dashboard
    Route::prefix('dashboard')->group(function () {

        // Rutas para gestión de usuarios
        Route::get('users', [UserController::class, 'index'])->name('users.index')->middleware('permission:users:list');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create')->middleware('permission:users:create');
        Route::post('users', [UserController::class, 'store'])->name('users.store')->middleware('permission:users:create');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit')->middleware('permission:users:edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:users:edit');
        Route::patch('users/{user}', [UserController::class, 'update'])->middleware('permission:users:edit');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:users:delete');
        Route::post('users/{id}/restore', [UserController::class, 'restore'])->name('users.restore')->middleware('permission:users:delete');
        // Olimpiadas
        Route::prefix('olimpiadas')->name('olimpiadas.')->group(function () {
            Route::get('/', [OlimpiadaController::class, 'index'])->name('index');
            Route::get('/crear', [OlimpiadaController::class, 'create'])->name('create');
            Route::post('/', [OlimpiadaController::class, 'store'])->name('store');
            Route::get('/{olimpiada}', [OlimpiadaController::class, 'show'])->name('show');
            Route::put('/{olimpiada}', [OlimpiadaController::class, 'update'])->name('update');
            Route::delete('/{olimpiada}', [OlimpiadaController::class, 'destroy'])->name('destroy');
        });

        // Fases de Olimpiadas
        Route::prefix('fases')->name('fases.')->group(function () {
            Route::get('/', [FaseOlimpiadaController::class, 'index'])->name('index');
            Route::get('/crear', [FaseOlimpiadaController::class, 'create'])->name('create');
        });
        
        // Inscripciones
        Route::prefix('inscripciones')->name('inscripciones.')->group(function () {
            Route::get('/', [InscripcionOlimpiadaController::class, 'index'])->name('index');
            Route::get('/crear', [InscripcionOlimpiadaController::class, 'create'])->name('create');
            Route::post('/', [InscripcionOlimpiadaController::class, 'store'])->name('store');
            Route::get('/{inscripcion}', [InscripcionOlimpiadaController::class, 'show'])->name('show');
            Route::put('/{inscripcion}', [InscripcionOlimpiadaController::class, 'update'])->name('update');
            Route::delete('/{inscripcion}', [InscripcionOlimpiadaController::class, 'destroy'])->name('destroy');
        });

        /**
         * Calificaciones (dashboard del calificador + flujo de edición)
         * URL base: /dashboard/calificaciones/*
         * Nombres: dashboard.calificaciones.*
         *
         * Subrecurso: inscripciones
         * Nombres: dashboard.calificaciones.olimpiadas.
         *
         */
        Route::prefix('calificaciones')->name('calificaciones.')->group(function () {

            // Inscripción a calificar (editar/guardar/finalizar)
            Route::prefix('olimpiadas')->name('olimpiadas.')->controller(CalificacionOlimpiadaController::class)->group(function () {
                // Dashboard del calificador (lista reclamadas/finalizadas/disponibles + filtros)
                Route::get('/', 'index')->name('index');
                Route::get('evaluacion/{evaluacion}', 'edit')->name('edit');
                Route::put('evaluacion/{evaluacion}', 'update')->name('update');
            });
        });

        Route::post('fases/{fase}/reorder', [FaseOlimpiadaController::class, 'reorder'])->name('fases.reorder');
        Route::get('gestion-evaluacion', [OlimpiadaController::class, 'showGestionEvaluacion'])->name('gestion-evaluacion.index');
    });

    Route::post('/users/{user}/send-reset-link', [UserController::class, 'sendResetLink'])
        ->name('users.send-reset-link')
        ->middleware('permission:users:reset-password');

    // Ruta para depurar un usuario específico
    Route::get('/users/{user}/debug', [UserController::class, 'debug'])
        ->name('users.debug')
        ->middleware('permission:users:view-all');
    // Rutas para gestión de eventos académicos
    Route::middleware(['auth', 'permission:academic:view'])->group(function () {

        Route::get('/dashboard/calendario', function () {
            $events = Evento::orderBy('fecha_inicio', 'asc')->get()->map(function ($evento) {
                return [
                    'id' => $evento->id,
                    'nombre' => $evento->nombre,
                    'clasificacion' => $evento->clasificacion,
                    'fecha_inicio' => $evento->fecha_inicio?->format('Y-m-d'),
                    'fecha_fin' => $evento->fecha_fin?->format('Y-m-d'),
                    'hora_inicio' => $evento->hora_inicio,
                    'hora_fin' => $evento->hora_fin,
                    'descripcion' => $evento->descripcion,
                    'ubicacion' => $evento->ubicacion,
                    'estado' => $evento->estado,
                    'created_at' => $evento->created_at,
                    'updated_at' => $evento->updated_at,
                ];
            });

            return Inertia::render('academic-forms/calendar', [
                'events' => $events,
            ]);
        })->name('calendario');

        Route::get('/dashboard/academico', function () {
            $events = Evento::orderBy('created_at', 'desc')->get()->map(function ($evento) {
                return [
                    'id' => $evento->id,
                    'nombre' => $evento->nombre,
                    'clasificacion' => $evento->clasificacion,
                    'fecha_inicio' => $evento->fecha_inicio?->format('Y-m-d'),
                    'fecha_fin' => $evento->fecha_fin?->format('Y-m-d'),
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

        // Rutas de gestión de eventos
        Route::middleware('permission:events:create')->group(function () {
            Route::post('/dashboard/academic-forms', [EventController::class, 'store'])
                ->name('academic-forms.store');
        });

        Route::middleware('permission:events:edit')->group(function () {
            Route::put('/dashboard/academic-forms/{event}', [EventController::class, 'update'])
                ->name('academic-forms.update');
        });

        Route::middleware('permission:events:delete')->group(function () {
            Route::delete('/dashboard/academic-forms/{event}', [EventController::class, 'destroy'])
                ->name('academic-forms.destroy');
        });

        // Rutas para formularios
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

            return Inertia::render('academic-forms/edit-event', [
                'event' => $mappedEvent,
            ]);
        })->name('academic-forms.edit');
    });
});

Route::middleware(['web', 'auth', 'check.event.period:registro-aspirantes'])->group(function () {});

Route::middleware(['web'])->group(function () {
    // Página que contiene el formulario de carga
    Route::get('/centros/importar', [CentroEducativoController::class, 'create'])->name('centros.create');

    // Ruta POST que procesa el archivo Excel
    Route::post('/centros', [CentroEducativoController::class, 'store'])->name('centros.store');

    // Página que contiene el formulario de admisión
    Route::get('/formulario-admision', [AdmisionController::class, 'create'])->name('admision.create');

    // Ruta POST que procesa el formulario de admision
    Route::post('/admision', [AdmisionController::class, 'store'])->name('admision.store');
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

Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status' => 'ok',
            'services' => [
                'database' => 'ok',
            ],
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'services' => [
                'database' => 'error',
            ],
        ], 503);
    }
});

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';

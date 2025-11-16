<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\UserController;
use App\Http\Controllers\CentroEducativoController;
use App\Http\Controllers\AdmisionController;
use App\Http\Controllers\AsignacionCalificadorController;
use App\Models\Evento;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CalificacionOlimpiadaController;
use App\Http\Controllers\DefinicionEvaluacionController;
use App\Http\Controllers\FaseOlimpiadaController;
use App\Http\Controllers\FaseGestionController;
use App\Http\Controllers\InscripcionOlimpiadaController;
use App\Http\Controllers\AreaDashboardController;
use App\Http\Controllers\OlimpiadaController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\ResultadoController;
use App\Http\Controllers\EvaluacionController;
use App\Http\Controllers\CalificacionController;
use App\Http\Controllers\GrupoController;
use App\Http\Controllers\AprobacionAcademicaController;

use Illuminate\Container\Attributes\Auth;

Route::post('estudiantes/generate-permanent-ids', [EstudianteController::class, 'generatePermanentIds'])->name('estudiantes.generate-permanent-ids');

Route::get('/', static function () {
    // Si el usuario está autenticado, siempre redirigir al dashboard principal.
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    // Si no, redirigir al login.
    return redirect()->route('login');
})->name('home');

Route::middleware(['check.status', 'auth', 'verified'])->group(function () {
    Route::get('/calificaciones', [CalificacionController::class, 'index'])->name('calificaciones.index'); //->middleware('role:Calificador')
    Route::post('/calificaciones', [CalificacionController::class, 'store'])->name('calificaciones.store');
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
        Route::get('olimpiadas', [OlimpiadaController::class, 'index'])->name('olimpiadas.index')->middleware('can:viewAny,App\Models\Olimpiada');
        Route::get('olimpiadas/create', [OlimpiadaController::class, 'create'])->name('olimpiadas.create')->middleware('can:create,App\Models\Olimpiada');
        Route::post('olimpiadas', [OlimpiadaController::class, 'store'])->name('olimpiadas.store')->middleware('can:create,App\Models\Olimpiada');
        Route::get('olimpiadas/{olimpiada}/edit', [OlimpiadaController::class, 'edit'])->name('olimpiadas.edit')->middleware('can:update,olimpiada');
        Route::put('olimpiadas/{olimpiada}', [OlimpiadaController::class, 'update'])->name('olimpiadas.update')->middleware('can:update,olimpiada');
        Route::delete('olimpiadas/{olimpiada}', [OlimpiadaController::class, 'destroy'])->name('olimpiadas.destroy')->middleware('can:delete,olimpiada');

        // Fases de Olimpiadas
        Route::prefix('fases')->name('fases.')->group(function () {
            // View any/list phases
            Route::get('/', [FaseOlimpiadaController::class, 'index'])->name('index')->middleware('can:viewAny,App\Models\FaseOlimpiada');
            Route::get('{fase}/resultados', [FaseOlimpiadaController::class, 'showResults'])->name('results')->middleware('can:view,fase');
            Route::get('{fase}/details', [FaseOlimpiadaController::class, 'getPhaseDetails'])->name('getPhaseDetails')->middleware('can:view,fase');

            // Create phases
            Route::get('/crear', [FaseOlimpiadaController::class, 'create'])->name('create')->middleware('can:create,App\Models\FaseOlimpiada');
            Route::post('{olimpiada}', [FaseOlimpiadaController::class, 'store'])->name('store')->middleware('can:create,App\Models\FaseOlimpiada');

            // Update phases
            Route::put('{fase}', [FaseOlimpiadaController::class, 'update'])->name('update')->middleware('can:update,fase');
            Route::patch('{fase}/details', [FaseOlimpiadaController::class, 'updateDetails'])->name('updateDetails')->middleware('can:update,fase');
            Route::put('/{fase}/gestion', [FaseGestionController::class, 'update'])->name('gestion.update')->middleware('can:update,fase');
            Route::post('/{fase}/publish-results', [FaseGestionController::class, 'publishResults'])->name('gestion.publishResults')->middleware('can:update,fase');

            // Delete phases
            Route::delete('{fase}', [FaseOlimpiadaController::class, 'destroy'])->name('destroy')->middleware('can:delete,fase');

            // Assign Nota Minima
            Route::post('/{fase}/assign-evaluation', [FaseOlimpiadaController::class, 'assignEvaluation'])->name('gestion.assignEvaluation')->middleware('can:assignNotaMinima,fase');
        });

        // Reorder phases (outside the group, as it was before, but with policy)
        Route::post('fases/{fase}/reorder', [FaseOlimpiadaController::class, 'reorder'])->name('fases.reorder')->middleware('can:reorder,fase');
        // Definiciones de Evaluación
        Route::prefix('definiciones-evaluacion')->name('definiciones-evaluacion.')->group(function () {
            Route::get('/', [DefinicionEvaluacionController::class, 'index'])->name('index')->middleware('permission:definiciones-evaluacion:list');
            Route::get('/crear', [DefinicionEvaluacionController::class, 'create'])->name('create')->middleware('permission:definiciones-evaluacion:create');
            Route::post('/', [DefinicionEvaluacionController::class, 'store'])->name('store')->middleware('permission:definiciones-evaluacion:create');
            Route::get('/{definicionEvaluacion}/editar', [DefinicionEvaluacionController::class, 'edit'])->name('edit')->middleware('permission:definiciones-evaluacion:edit');
            Route::put('/{definicionEvaluacion}', [DefinicionEvaluacionController::class, 'update'])->name('update')->middleware('permission:definiciones-evaluacion:edit');
            Route::delete('/{definicionEvaluacion}', [DefinicionEvaluacionController::class, 'destroy'])->name('destroy')->middleware('permission:definiciones-evaluacion:delete');
        });

        // Grupos
        Route::resource('grupos', GrupoController::class)->middleware(['auth', 'role:coordinador-area|admin-academico']);

        // Inscripciones
        Route::get('inscripciones', [InscripcionOlimpiadaController::class, 'gestionIndex'])->name('inscripciones.gestion')->middleware('permission:olimpiadas:list');

        // Rutas para Resultados
        Route::prefix('resultados')->name('resultados.')->group(function () {
            Route::get('/', [ResultadoController::class, 'index'])->name('index')->middleware('permission:resultados:view');
            Route::get('/{fase}', [ResultadoController::class, 'getResultsForFase'])->name('fase')->middleware('permission:resultados:view');
            Route::get('/emails', [ResultadoController::class, 'getEmailsForPassedStudents'])->name('emails')->middleware('permission:resultados:export-emails');
        });

        // Ruta para el Dashboard del Área
        Route::get('area', [AreaDashboardController::class, 'index'])->name('area.dashboard')->middleware('permission:academic:view');

        // Rutas para el Dashboard de Calificador de Olimpiadas
        Route::get('calificaciones/olimpiadas', [CalificacionOlimpiadaController::class, 'index'])->name('calificaciones.olimpiadas.index')->middleware('role:calificador|admin-academico');
        Route::get('calificaciones/olimpiadas/{evaluacion}/edit', [CalificacionOlimpiadaController::class, 'edit'])->name('calificaciones.olimpiadas.edit')->middleware('role:calificador|admin-academico');
        Route::put('calificaciones/olimpiadas/{evaluacion}', [CalificacionOlimpiadaController::class, 'update'])->name('calificaciones.olimpiadas.update')->middleware('role:calificador|admin-academico');

        // Ruta para la Gestión de Evaluación (Asignación de Calificadores)
        Route::get('gestion-evaluacion', [AsignacionCalificadorController::class, 'index'])->name('gestion-evaluacion.index')->middleware('permission:calificadores:assign');
        Route::post('asignaciones/sync-for-item', [AsignacionCalificadorController::class, 'syncForItem'])->name('asignaciones.syncForItem')->middleware('permission:calificadores:assign');
        Route::post('asignaciones', [AsignacionCalificadorController::class, 'store'])->name('asignaciones.store')->middleware('permission:calificadores:assign');
        
        // Ruta para mostrar detalles de evaluación
        Route::get('evaluaciones/{evaluacion}', [EvaluacionController::class, 'show'])->name('evaluaciones.show')->middleware('permission:resultados:view');
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
    Route::get('/centros/importar', [CentroEducativoController::class, 'create'])->name('centros.create')->middleware('permission:centros-educativos:import');

    // Ruta POST que procesa el archivo Excel
    Route::post('/centros', [CentroEducativoController::class, 'store'])->name('centros.store')->middleware('permission:centros-educativos:import');

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

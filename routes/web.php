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
use App\Http\Controllers\CalificacionInscripcionController;
use App\Http\Controllers\InscripcionOlimpiadaController;
use App\Http\Controllers\OlimpiadaController;
use App\Http\Controllers\InternadoFDTCController;
use App\Http\Controllers\InternadoParticipanteController;
use App\Http\Controllers\InternadoEvaluacionController;
use App\Http\Controllers\InternadoPeriodoController;
use App\Http\Controllers\InternadoAsistenciaController;
use App\Http\Controllers\InternadoConductaController;

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

        // Inscripciones
        Route::prefix('inscripciones')->name('inscripciones.')->group(function () {
            Route::get('/', [InscripcionOlimpiadaController::class, 'index'])->name('index');
            Route::get('/crear', [InscripcionOlimpiadaController::class, 'create'])->name('create');
            Route::post('/', [InscripcionOlimpiadaController::class, 'store'])->name('store');
            Route::get('/{inscripcion}', [InscripcionOlimpiadaController::class, 'show'])->name('show');
            Route::put('/{inscripcion}', [InscripcionOlimpiadaController::class, 'update'])->name('update');
            Route::delete('/{inscripcion}', [InscripcionOlimpiadaController::class, 'destroy'])->name('destroy');
        });

        // Calificar Inscripciones
        Route::prefix('calificar-inscripciones')->name('calificar-inscripciones.')->group(function () {
            Route::get('/', [CalificacionInscripcionController::class, 'index'])->name('index');
            Route::get('/{inscripcion}', [CalificacionInscripcionController::class, 'show'])->name('show');
            Route::put('/{inscripcion}', [CalificacionInscripcionController::class, 'update'])->name('update');
        });
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
                'nombre' => $event->nombre,             
                'clasificacion' => $event->clasificacion, 
                'fecha_inicio' => $event->fecha_inicio ? $event->fecha_inicio->format('Y-m-d') : null,
                'fecha_fin' => $event->fecha_fin ? $event->fecha_fin->format('Y-m-d') : null, 
                'hora_inicio' => $event->hora_inicio,    
                'hora_fin' => $event->hora_fin,          
                'descripcion' => $event->descripcion,   
                'ubicacion' => $event->ubicacion,      
                'estado' => $event->estado,            
                'created_at' => $event->created_at,
                'updated_at' => $event->updated_at,
            ];

            return Inertia::render('academic-forms/edit-event', [
                'event' => $mappedEvent,
            ]);
        })->name('academic-forms.edit');
    });
});

// Rutas para gestión del internado FDTC
Route::middleware(['auth', 'permission:internado:view'])->prefix('dashboard/internado-fdtc')->name('internado-fdtc.')->group(function () {
    
    // Rutas de solo lectura
    Route::get('seleccion', [InternadoFDTCController::class, 'selection_list'])->name('selection_list');
    Route::get('participantes', [InternadoParticipanteController::class, 'participants_list'])->name('participantes');
    Route::get('participantes/{participante}/progreso', [InternadoParticipanteController::class, 'progreso'])->name('participantes.progreso');
    
    Route::get('periodos', [InternadoPeriodoController::class, 'periodos'])->name('periodos');
    
    Route::get('evaluaciones', [InternadoEvaluacionController::class, 'evaluaciones'])->name('evaluaciones');
    
    Route::get('asistencias', [InternadoAsistenciaController::class, 'asistencias'])->name('asistencias');
    Route::get('asistencias/reporte', [InternadoAsistenciaController::class, 'reporte'])->name('asistencias.reporte');
    Route::get('asistencias/reporte/detalle', [InternadoAsistenciaController::class, 'detalle'])->name('asistencias.reporte.detalle');
    
    Route::get('conductas', [InternadoConductaController::class, 'conductas'])->name('conductas');
    Route::get('conductas/reporte', [InternadoConductaController::class, 'reporte'])->name('conductas.reporte');
    Route::get('conductas/reporte/detalle', [InternadoConductaController::class, 'detalle'])->name('conductas.reporte.detalle');

    // Rutas protegidas con internado:manage
    Route::middleware('permission:internado:manage')->group(function () {
        
        // Participantes
        Route::post('add', [InternadoFDTCController::class, 'add'])->name('add');
        Route::post('participantes/cambiar-estado', [InternadoParticipanteController::class, 'cambiarEstado'])->name('participantes.cambiar-estado');
        Route::post('participantes/remover', [InternadoParticipanteController::class, 'remover'])->name('participantes.remover');

        // Periodos
        Route::post('periodos', [InternadoPeriodoController::class, 'store'])->name('periodos.store');
        Route::get('periodos/create', [InternadoPeriodoController::class, 'create'])->name('periodos.create');
        Route::get('periodos/{periodo}/edit', [InternadoPeriodoController::class, 'edit'])->name('periodos.edit');
        Route::put('periodos/{periodo}', [InternadoPeriodoController::class, 'update'])->name('periodos.update');
        Route::delete('periodos/{periodo}', [InternadoPeriodoController::class, 'destroy'])->name('periodos.destroy');
        Route::patch('periodos/{periodo}/toggle', [InternadoPeriodoController::class, 'toggleActivo'])->name('periodos.toggle');

        // Evaluaciones
        Route::post('evaluaciones', [InternadoEvaluacionController::class, 'store'])->name('evaluaciones.store');
        Route::get('evaluaciones/create', [InternadoEvaluacionController::class, 'create'])->name('evaluaciones.create');
        Route::get('evaluaciones/{evaluacion}/edit', [InternadoEvaluacionController::class, 'edit'])->name('evaluaciones.edit');
        Route::put('evaluaciones/{evaluacion}', [InternadoEvaluacionController::class, 'update'])->name('evaluaciones.update');
        Route::delete('evaluaciones/{evaluacion}', [InternadoEvaluacionController::class, 'destroy'])->name('evaluaciones.destroy');
        Route::get('evaluaciones/show/{evaluacion}', [InternadoEvaluacionController::class, 'show'])->name('evaluaciones.show');

        // Asistencias
        Route::post('asistencias', [InternadoAsistenciaController::class, 'store'])->name('asistencias.store');
        Route::post('asistencias/masivo', [InternadoAsistenciaController::class, 'storeMasivo'])->name('asistencias.masivo');

        // Calificaciones: guardar individual y masivo
        Route::put('calificaciones/{calificacion}', [InternadoEvaluacionController::class, 'guardarCalificacion'])->name('calificaciones.guardar');
        Route::post('calificaciones/guardar-masivo/{evaluacion}', [InternadoEvaluacionController::class, 'guardarCalificacionesMasivo'])->name('calificaciones.guardar-masivo');

        // Conductas
        Route::post('conductas', [InternadoConductaController::class, 'store'])->name('conductas.store');
        Route::post('conductas/masivo', [InternadoConductaController::class, 'storeMasivo'])->name('conductas.masivo');
    });
});

Route::middleware(['web', 'auth', 'check.event.period:registro-aspirantes'])->group(function () {
    // Página que contiene el formulario de carga
    Route::get('/centros/importar', [CentroEducativoController::class, 'create'])->name('centros.create');

    // Ruta POST que procesa el archivo Excel
    Route::post('/centros', [CentroEducativoController::class, 'store'])->name('centros.store');

    // Página que contiene el formulario de admisión
    Route::get('/formulario-admision', [AdmisionController::class, 'create'])->name('admision.create');

    // Ruta POST que procesa el formulario de admision
    Route::post('/admision', [AdmisionController::class, 'store'])->name('admision.store');
});

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

// Rutas de API públicas para el formulario de admisión (sin CSRF)
Route::withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)->group(function () {
    Route::post('api/check-duplicate', [App\Http\Controllers\Api\DuplicateCheckController::class, 'checkDuplicate']);
});

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';

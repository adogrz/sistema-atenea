<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\UserController;
use App\Http\Controllers\CentroEducativoController;
use App\Http\Controllers\AdmisionController;
use App\Http\Controllers\CalificacionInscripcionController;
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
    // Ruta para el dashboard de inscripciones del estudiante
    Route::get('/mis-inscripciones', [InscripcionOlimpiadaController::class, 'index'])->name('inscripciones.student.index');

    // Dashboard principal (contextual)
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
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
});

// Las rutas de carga de centros educativos se han movido a routes/academic.php

// Rutas públicas de admisión de aspirantes (sin autenticación, solo verificar evento activo)
Route::middleware(['web', 'check.event.period:registro-aspirantes'])->group(function () {
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



// Rutas de eventos académicos
require __DIR__ . '/academic.php';

// Rutas del internado FDTC
require __DIR__ . '/internado.php';

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/clinical-records.php';
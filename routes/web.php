<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\UserController;
use App\Http\Controllers\CentroEducativoController;
use App\Http\Controllers\AdmisionController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CalificacionInscripcionController;
use App\Http\Controllers\InscripcionOlimpiadaController;
use App\Http\Controllers\OlimpiadaController;
use App\Models\Evento;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| - Estructura por dominios funcionales
*/

/**
 * Home: redirige según estado de autenticación.
 */
Route::get('/', static function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

/**
 * Público (sin auth): formularios de centros y admisión.
 * Nota: el middleware "web" se aplica por defecto a web.php.
 */
Route::prefix('/')
    ->group(function () {
        // Centros Educativos (importar desde Excel)
        Route::get('centros/importar', [CentroEducativoController::class, 'create'])
            ->name('centros.create');
        Route::post('centros', [CentroEducativoController::class, 'store'])
            ->name('centros.store');

        // Admisión (formulario público)
        Route::get('formulario-admision', [AdmisionController::class, 'create'])
            ->name('admision.create');
        Route::post('admision', [AdmisionController::class, 'store'])
            ->name('admision.store');
    });

/**
 * Autenticados y verificados.
 */
Route::middleware(['auth', 'verified', 'check.status'])
    ->group(function () {
        // Dashboard principal
        Route::get('/dashboard', static fn () => Inertia::render('dashboard'))
            ->name('dashboard');

        // Auditoría de actividad (Spatie Activitylog)
        Route::get('/dashboard/audit', static function () {
            if (!auth()->user()->hasPermissionTo('audit:view')) {
                abort(403);
            }
            $logs = Activity::with('causer')->latest()->get();

            return Inertia::render('dashboard-audit', [
                'logs' => $logs,
            ]);
        })->name('dashboard.audit')->middleware('permission:audit:view');

        /**
         * Bloque /dashboard
         */
        Route::prefix('dashboard')->name('dashboard.')->group(function () {
            /**
             * Gestión de usuarios (permisos por acción).
             */
            Route::prefix('users')
                ->name('users.')
                ->controller(UserController::class)
                ->group(function () {
                    Route::get('/', 'index')->name('index')->middleware('permission:users:list');
                    Route::get('/create', 'create')->name('create')->middleware('permission:users:create');
                    Route::post('/', 'store')->name('store')->middleware('permission:users:create');
                    Route::get('/{user}/edit', 'edit')->name('edit')->middleware('permission:users:edit');
                    Route::match(['put', 'patch'], '/{user}', 'update')->name('update')->middleware('permission:users:edit');
                    Route::delete('/{user}', 'destroy')->name('destroy')->middleware('permission:users:delete');
                    Route::post('/{id}/restore', 'restore')->name('restore')->middleware('permission:users:delete');
                });

            /**
             * Olimpiadas
             */
            Route::prefix('olimpiadas')
                ->name('olimpiadas.')
                ->controller(OlimpiadaController::class)
                ->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::get('/crear', 'create')->name('create');
                    Route::post('/', 'store')->name('store');
                    Route::get('/{olimpiada}', 'show')->name('show');
                    Route::put('/{olimpiada}', 'update')->name('update');
                    Route::delete('/{olimpiada}', 'destroy')->name('destroy');
                });

            /**
             * Inscripciones
             */
            Route::prefix('inscripciones')
                ->name('inscripciones.')
                ->controller(InscripcionOlimpiadaController::class)
                ->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::get('/crear', 'create')->name('create');
                    Route::post('/', 'store')->name('store');
                    Route::get('/{inscripcion}', 'show')->name('show');
                    Route::put('/{inscripcion}', 'update')->name('update');
                    Route::delete('/{inscripcion}', 'destroy')->name('destroy');
                });

            /**
             * Calificar Inscripciones (flujo de calificación)
             */
            Route::prefix('calificar-inscripciones')
                ->name('calificar-inscripciones.')
                ->controller(CalificacionInscripcionController::class)
                ->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::get('/{inscripcion}', 'show')->name('show');
                    Route::put('/{inscripcion}', 'update')->name('update');
                });

            /**
             * Módulo Académico / Calendario de eventos
             * Protegido por permiso global "academic:view".
             */
            Route::middleware('permission:academic:view')->group(function () {
                // Vista: calendario (orden por fecha de inicio asc)
                Route::get('calendario', static function () {
                    $events = Evento::orderBy('fecha_inicio', 'asc')
                        ->get()
                        ->map(fn ($e) => [
                            'id'           => $e->id,
                            'nombre'       => $e->nombre,
                            'clasificacion'=> $e->clasificacion,
                            'fecha_inicio' => $e->fecha_inicio?->format('Y-m-d'),
                            'fecha_fin'    => $e->fecha_fin?->format('Y-m-d'),
                            'hora_inicio'  => $e->hora_inicio,
                            'hora_fin'     => $e->hora_fin,
                            'descripcion'  => $e->descripcion,
                            'ubicacion'    => $e->ubicacion,
                            'estado'       => $e->estado,
                            'created_at'   => $e->created_at,
                            'updated_at'   => $e->updated_at,
                        ]);

                    return Inertia::render('academic-forms/calendar', [
                        'events' => $events,
                    ]);
                })->name('calendario');

                // Vista: listado académico (orden por created_at desc)
                Route::get('academico', static function () {
                    $events = Evento::orderBy('created_at', 'desc')
                        ->get()
                        ->map(fn ($e) => [
                            'id'           => $e->id,
                            'nombre'       => $e->nombre,
                            'clasificacion'=> $e->clasificacion,
                            'fecha_inicio' => $e->fecha_inicio?->format('Y-m-d'),
                            'fecha_fin'    => $e->fecha_fin?->format('Y-m-d'),
                            'hora_inicio'  => $e->hora_inicio,
                            'hora_fin'     => $e->hora_fin,
                            'descripcion'  => $e->descripcion,
                            'ubicacion'    => $e->ubicacion,
                            'estado'       => $e->estado,
                            'created_at'   => $e->created_at,
                            'updated_at'   => $e->updated_at,
                        ]);

                    return Inertia::render('dashboard-academico', [
                        'events' => $events,
                    ]);
                })->name('academico');

                // Acciones de eventos (crear/editar/eliminar) con permisos específicos
                Route::post('academic-forms', [EventController::class, 'store'])
                    ->name('academic-forms.store')
                    ->middleware('permission:events:create');

                Route::put('academic-forms/{event}', [EventController::class, 'update'])
                    ->name('academic-forms.update')
                    ->middleware('permission:events:edit');

                Route::delete('academic-forms/{event}', [EventController::class, 'destroy'])
                    ->name('academic-forms.destroy')
                    ->middleware('permission:events:delete');

                // Formularios (Inertia)
                Route::inertia('academic-forms/create-event', 'academic-forms/create-event')
                    ->name('academic-forms.create-event');

                Route::get('academic-forms/{event}/edit', static function (Evento $event) {
                    $mapped = [
                        'id'         => $event->id,
                        'name'       => $event->nombre,
                        'type'       => $event->clasificacion,
                        'start_date' => $event->fecha_inicio,
                        'end_date'   => $event->fecha_fin,
                        'start_time' => $event->hora_inicio,
                        'end_time'   => $event->hora_fin,
                        'description'=> $event->descripcion,
                        'location'   => $event->ubicacion,
                        'status'     => $event->estado,
                        'created_at' => $event->created_at,
                        'updated_at' => $event->updated_at,
                    ];
                    return Inertia::render('academic-forms/edit-event', ['event' => $mapped]);
                })->name('academic-forms.edit');
            });
        });

        // Utilidades de usuarios fuera del bloque /dashboard si deseas URL más corta
        Route::post('/users/{user}/send-reset-link', [UserController::class, 'sendResetLink'])
            ->name('users.send-reset-link')
            ->middleware('permission:users:reset-password');

        Route::get('/users/{user}/debug', [UserController::class, 'debug'])
            ->name('users.debug')
            ->middleware('permission:users:view-all');
    });

/**
 * Health-check simple para orquestadores/monitoring.
 */
Route::get('/health', static function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'status'   => 'ok',
            'services' => ['database' => 'ok'],
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'   => 'error',
            'services' => ['database' => 'error'],
        ], 503);
    }
});

/**
 * Rutas de autenticación y ajustes
 */
require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';

/**
 * (Opcional) Datos de ejemplo SOLO en local para no colisionar con la ruta real.
 * Evita duplicar /dashboard/academico en producción.
 */
// if (app()->environment('local')) {
//     Route::get('/dashboard/academico-sample', static function () {
//         $sampleEvents = [ /* ...tus datos de ejemplo... */ ];
//         return Inertia::render('dashboard-academico', ['events' => $sampleEvents]);
//     })->name('dashboard.academico.sample');
// }

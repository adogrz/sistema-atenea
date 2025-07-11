<?php

use App\Http\Controllers\UserController;
use App\Models\Departamento;
use App\Models\Municipio;
use App\Models\Distrito;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Collection;

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
        Route::resource('users', UserController::class)->except(['show'])->middleware([
            'index' => 'permission:users:list',
            'create' => 'permission:users:create',
            'store' => 'permission:users:create',
            'edit' => 'permission:users:edit',
            'update' => 'permission:users:edit',
            'destroy' => 'permission:users:delete',
        ]);
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

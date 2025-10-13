<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClinicalRecord\AssignmentController;

/**
 * Rutas para el módulo de Registros Clínicos
 *
 * Este archivo contiene todas las rutas relacionadas con:
 * - Asignaciones de estudiantes a profesionales (médicos/psicólogos)
 * - Expedientes médicos
 * - Expedientes psicológicos
 * - Consultas y sesiones
 */

Route::middleware(['auth', 'verified', 'check.status'])
    ->prefix('dashboard/clinical-records')
    ->name('clinical-records.')
    ->group(function () {

        // Rutas de Asignaciones (Assignments)
        Route::prefix('assignments')->name('assignments.')->group(function () {
            // Listar asignaciones
            Route::get('/', [AssignmentController::class, 'index'])
                ->name('index');

            // Crear nueva asignación
            Route::get('/create', [AssignmentController::class, 'create'])
                ->name('create');

            Route::post('/', [AssignmentController::class, 'store'])
                ->name('store');

            // Ver asignación específica
            Route::get('/{assignment}', [AssignmentController::class, 'show'])
                ->name('show');

            // Editar asignación
            Route::get('/{assignment}/edit', [AssignmentController::class, 'edit'])
                ->name('edit');

            Route::put('/{assignment}', [AssignmentController::class, 'update'])
                ->name('update');

            Route::patch('/{assignment}', [AssignmentController::class, 'update'])
                ->name('patch');

            // Eliminar asignación (soft delete)
            Route::delete('/{assignment}', [AssignmentController::class, 'destroy'])
                ->name('destroy');

            // Restaurar asignación eliminada
            Route::post('/{assignment}/restore', [AssignmentController::class, 'restore'])
                ->name('restore');
        });
    });

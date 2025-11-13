<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClinicalRecord\AssignmentController;
use App\Http\Controllers\ClinicalRecord\MedicalConsultationController;
use App\Http\Controllers\ClinicalRecord\MedicalRecordController;
use App\Http\Controllers\ClinicalRecord\PsychologicalRecordController;
use App\Http\Controllers\ClinicalRecord\PsychologicalSessionController;
use App\Http\Controllers\ClinicalRecord\ConsentFormController;

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
            // Búsqueda de entidades para asignaciones (ANTES de las rutas con parámetros)
            Route::get('/search/students', [AssignmentController::class, 'searchStudents'])
                ->name('search.students');

            Route::get('/search/professionals', [AssignmentController::class, 'searchProfessionals'])
                ->name('search.professionals');

            // Listar asignaciones
            Route::get('/', [AssignmentController::class, 'index'])
                ->name('index');

            // Crear nueva asignación
            Route::get('/create', [AssignmentController::class, 'create'])
                ->name('create');

            Route::post('/', [AssignmentController::class, 'store'])
                ->name('store');

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
        });

        // Rutas de Expedientes Médicos (Medical Records)
        Route::prefix('medical-records')->name('medical-records.')->group(function () {
            Route::get('/', [MedicalRecordController::class, 'index'])
                ->name('index');

            Route::get('/create', [MedicalRecordController::class, 'create'])
                ->name('create');

            Route::post('/', [MedicalRecordController::class, 'store'])
                ->name('store');

            Route::get('/{medical_record}', [MedicalRecordController::class, 'show'])
                ->name('show');

            Route::get('/{medical_record}/edit', [MedicalRecordController::class, 'edit'])
                ->name('edit');

            Route::put('/{medical_record}', [MedicalRecordController::class, 'update'])
                ->name('update');

            Route::patch('/{medical_record}', [MedicalRecordController::class, 'update'])
                ->name('patch');

            Route::delete('/{medical_record}', [MedicalRecordController::class, 'destroy'])
                ->name('destroy');

            // Ruta para visualizar archivo de consentimiento (inline)
            Route::get('/consent-forms/{consent_form}/file', [ConsentFormController::class, 'file'])
                ->name('consent-forms.file');

            // Rutas anidadas para Consultas Médicas dentro de un Expediente
            Route::prefix('{medical_record}/consultations')->name('consultations.')->group(function () {
                Route::get('/create', [MedicalConsultationController::class, 'create'])
                    ->name('create');

                Route::post('/', [MedicalConsultationController::class, 'store'])
                    ->name('store');

                Route::get('/{consultation}', [MedicalConsultationController::class, 'show'])
                    ->name('show');

                Route::get('/{consultation}/edit', [MedicalConsultationController::class, 'edit'])
                    ->name('edit');

                Route::put('/{consultation}', [MedicalConsultationController::class, 'update'])
                    ->name('update');

                Route::patch('/{consultation}', [MedicalConsultationController::class, 'update'])
                    ->name('patch');

                Route::delete('/{consultation}', [MedicalConsultationController::class, 'destroy'])
                    ->name('destroy');

                Route::post('/{consultation}/restore', [MedicalConsultationController::class, 'restore'])
                    ->name('restore');
            });
        });

        // Rutas de Expedientes Psicológicos (Psychological Records)
        Route::prefix('psychological-records')->name('psychological-records.')->group(function () {
            Route::get('/', [PsychologicalRecordController::class, 'index'])
                ->name('index');

            Route::get('/create', [PsychologicalRecordController::class, 'create'])
                ->name('create');

            Route::post('/', [PsychologicalRecordController::class, 'store'])
                ->name('store');

            Route::get('/{psychological_record}', [PsychologicalRecordController::class, 'show'])
                ->name('show');

            Route::get('/{psychological_record}/edit', [PsychologicalRecordController::class, 'edit'])
                ->name('edit');

            Route::put('/{psychological_record}', [PsychologicalRecordController::class, 'update'])
                ->name('update');

            Route::patch('/{psychological_record}', [PsychologicalRecordController::class, 'update'])
                ->name('patch');

            Route::delete('/{psychological_record}', [PsychologicalRecordController::class, 'destroy'])
                ->name('destroy');

            // Rutas anidadas para Sesiones Psicológicas dentro de un Expediente
            Route::prefix('{psychological_record}/sessions')->name('sessions.')->group(function () {
                Route::get('/create', [PsychologicalSessionController::class, 'create'])
                    ->name('create');

                Route::post('/', [PsychologicalSessionController::class, 'store'])
                    ->name('store');

                Route::get('/{session}', [PsychologicalSessionController::class, 'show'])
                    ->name('show');

                Route::get('/{session}/edit', [PsychologicalSessionController::class, 'edit'])
                    ->name('edit');

                Route::put('/{session}', [PsychologicalSessionController::class, 'update'])
                    ->name('update');

                Route::patch('/{session}', [PsychologicalSessionController::class, 'update'])
                    ->name('patch');

                Route::delete('/{session}', [PsychologicalSessionController::class, 'destroy'])
                    ->name('destroy');

                Route::post('/{session}/restore', [PsychologicalSessionController::class, 'restore'])
                    ->name('restore');
            });
        });
    });

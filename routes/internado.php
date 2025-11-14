<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InternadoFDTCController;
use App\Http\Controllers\InternadoParticipanteController;
use App\Http\Controllers\InternadoEvaluacionController;
use App\Http\Controllers\InternadoPeriodoController;
use App\Http\Controllers\InternadoAsistenciaController;
use App\Http\Controllers\InternadoConductaController;

// Rutas para gestión del internado FDTC
Route::middleware(['auth'])->prefix('dashboard/internado-fdtc')->name('internado-fdtc.')->group(function () {
    
    // Rutas solo para admin-academico (selección, participantes, periodos)
    Route::middleware('permission:internado:admin:view')->group(function () {
        Route::get('seleccion', [InternadoFDTCController::class, 'selection_list'])->name('selection_list');
        Route::get('participantes', [InternadoParticipanteController::class, 'participants_list'])->name('participantes');
        Route::get('participantes/{participante}/progreso', [InternadoParticipanteController::class, 'progreso'])->name('participantes.progreso');
        Route::get('periodos', [InternadoPeriodoController::class, 'periodos'])->name('periodos');
    });
    
    // Rutas para evaluaciones (calificador y admin-academico)
    Route::middleware('permission:internado:evaluaciones:view')->group(function () {
        Route::get('evaluaciones', [InternadoEvaluacionController::class, 'evaluaciones'])->name('evaluaciones');
    });
    
    // Rutas para asistencias (calificador y admin-academico)
    Route::middleware('permission:internado:asistencias:view')->group(function () {
        Route::get('asistencias', [InternadoAsistenciaController::class, 'asistencias'])->name('asistencias');
        Route::get('asistencias/reporte', [InternadoAsistenciaController::class, 'reporte'])->name('asistencias.reporte');
        Route::get('asistencias/reporte/detalle', [InternadoAsistenciaController::class, 'detalle'])->name('asistencias.reporte.detalle');
    });
    
    // Rutas para conductas (calificador y admin-academico)
    Route::middleware('permission:internado:conductas:view')->group(function () {
        Route::get('conductas', [InternadoConductaController::class, 'conductas'])->name('conductas');
        Route::get('conductas/reporte', [InternadoConductaController::class, 'reporte'])->name('conductas.reporte');
        Route::get('conductas/reporte/detalle', [InternadoConductaController::class, 'detalle'])->name('conductas.reporte.detalle');
    });

    // Rutas protegidas con internado:manage (solo admin-academico con permisos completos)
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

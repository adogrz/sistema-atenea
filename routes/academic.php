<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Evento;
use App\Http\Controllers\EventController;

// Rutas para gestión de eventos académicos
Route::middleware(['auth', 'permission:academic:view'])->group(function () {
    
    // Vista del calendario
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

    // Dashboard académico
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

    // Formulario de creación
    Route::get('/dashboard/academic-forms/create-event', function () {
        return Inertia::render('academic-forms/create-event');
    })->name('academic-forms.create-event');

    // Formulario de edición
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

    // Rutas de gestión de eventos (POST, PUT, DELETE)
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
});

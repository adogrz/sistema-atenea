<?php

namespace App\Http\Controllers;

use App\Events\AcademicPeriodChanged;
use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class EventController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:academic:view');
        $this->middleware('permission:events:create')->only(['store']);
        $this->middleware('permission:events:edit')->only(['update']);
        $this->middleware('permission:events:delete')->only(['destroy']);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'clasificacion' => ['required', 'in:' . implode(',', Evento::getClasificaciones())],
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'nullable|string|max:255',
            'estado' => ['required', Rule::in(['activo', 'inactivo', 'completado'])],
        ]);

        if ($validated['fecha_inicio'] === $validated['fecha_fin'] && 
        !empty($validated['hora_inicio']) && !empty($validated['hora_fin'])) {
        
        // Convertir a objetos Carbon para comparación precisa
        $horaInicio = \Carbon\Carbon::createFromFormat('H:i', $validated['hora_inicio']);
        $horaFin = \Carbon\Carbon::createFromFormat('H:i', $validated['hora_fin']);
        
        if ($horaFin->lte($horaInicio)) {
            return back()->withErrors([
                'hora_fin' => 'La hora de fin debe ser posterior a la hora de inicio.'
            ])->withInput();
        }
    }

        $evento = Evento::create([
            'nombre' => $validated['nombre'],
            'clasificacion' => $validated['clasificacion'],
            'tipo' => $validated['clasificacion'],
            'descripcion' => $validated['descripcion'] ?? $validated['nombre'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin' => $validated['fecha_fin'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin' => $validated['hora_fin'],
            'ubicacion' => $validated['ubicacion'],
            'estado' => $validated['estado'],
        ]);

        // Disparar evento si el período está activo hoy
        if ($evento->estado === 'activo' && $this->isEventActiveToday($evento)) {
            event(new AcademicPeriodChanged($evento, 'started'));
        }

        return redirect()->route('dashboard_academico')
            ->with('success', 'Evento creado exitosamente');
    }

    public function update(Request $request, Evento $event): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'clasificacion' => ['required', 'in:' . implode(',', Evento::getClasificaciones())],
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'nullable|string|max:255',
            'estado' => ['required', Rule::in(['activo', 'inactivo', 'completado'])],
        ]);

        if ($validated['fecha_inicio'] === $validated['fecha_fin'] && 
        !empty($validated['hora_inicio']) && !empty($validated['hora_fin'])) {
        
        // Convertir a objetos Carbon para comparación precisa
        $horaInicio = \Carbon\Carbon::createFromFormat('H:i', $validated['hora_inicio']);
        $horaFin = \Carbon\Carbon::createFromFormat('H:i', $validated['hora_fin']);
        
        if ($horaFin->lte($horaInicio)) {
            return back()->withErrors([
                'hora_fin' => 'La hora de fin debe ser posterior a la hora de inicio.'
            ])->withInput();
        }
    }

        $wasActive = $event->estado === 'activo' && $this->isEventActiveToday($event);

        $event->update([
            'nombre' => $validated['nombre'],
            'clasificacion' => $validated['clasificacion'],
            'tipo' => $validated['clasificacion'],
            'descripcion' => $validated['descripcion'] ?? $event->descripcion,
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin' => $validated['fecha_fin'],
            'hora_inicio' => $validated['hora_inicio'] ?? $event->hora_inicio,
            'hora_fin' => $validated['hora_fin'] ?? $event->hora_fin,
            'ubicacion' => $validated['ubicacion'] ?? $event->ubicacion,
            'estado' => $validated['estado'],
        ]);

        if ($event->clasificacion === 'registro-aspirantes') {
            // Aquí puedes limpiar cualquier caché relacionado
            Cache::forget('active_registration_period');
        }

        $isNowActive = $event->estado === 'activo' && $this->isEventActiveToday($event);

        // Disparar eventos según los cambios
        if (!$wasActive && $isNowActive) {
            event(new AcademicPeriodChanged($event, 'started'));
        } elseif ($wasActive && !$isNowActive) {
            event(new AcademicPeriodChanged($event, 'ended'));
        }

        return redirect()->route('dashboard_academico')
            ->with('success', 'Evento actualizado exitosamente');
    }

    public function destroy(Evento $event): RedirectResponse
    {
        // Disparar evento de finalización si estaba activo
        if ($event->estado === 'activo' && $this->isEventActiveToday($event)) {
            event(new AcademicPeriodChanged($event, 'ended'));
        }

        $event->delete();

        return redirect()->route('dashboard_academico')
            ->with('success', 'Evento eliminado exitosamente');
    }

    private function isEventActiveToday(Evento $evento): bool
    {
        $now = Carbon::now();
        
        // Usar los accessors que combinan fecha y hora
        $fechaHoraInicio = $evento->fecha_hora_inicio;
        $fechaHoraFin = $evento->fecha_hora_fin;
        
        // Verificar si estamos dentro del período
        return $now->between($fechaHoraInicio, $fechaHoraFin);
    }

    public function edit($id)
    {
        $event = Evento::findOrFail($id);
        
        return inertia('academic-forms/edit-event', [
            'event' => $event
        ]);
    }
}
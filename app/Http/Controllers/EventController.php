<?php

namespace App\Http\Controllers;

use App\Events\AcademicPeriodChanged;
use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

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
            'name' => 'required|string|max:255',
            'type' => ['required', 'in:' . implode(',', Evento::getClasificaciones())],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'status' => ['required', Rule::in(['activo', 'inactivo', 'completado'])],
        ]);

        $evento = Evento::create([
            'nombre' => $validated['name'],
            'clasificacion' => $validated['type'],
            'tipo' => $validated['type'],
            'descripcion' => $validated['description'] ?? $validated['name'],
            'fecha_inicio' => $validated['start_date'],
            'fecha_fin' => $validated['end_date'],
            'hora_inicio' => $validated['start_time'],
            'hora_fin' => $validated['end_time'],
            'ubicacion' => $validated['location'],
            'estado' => $validated['status'],
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
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'status' => ['required', Rule::in(['activo', 'inactivo', 'completado'])],
        ]);

        $wasActive = $event->estado === 'activo' && $this->isEventActiveToday($event);

        $event->update([
            'nombre' => $validated['name'],
            'clasificacion' => $validated['type'],
            'tipo' => $validated['type'],
            'descripcion' => $validated['description'] ?? $validated['name'],
            'fecha_inicio' => $validated['start_date'],
            'fecha_fin' => $validated['end_date'],
            'hora_inicio' => $validated['start_time'],
            'hora_fin' => $validated['end_time'],
            'ubicacion' => $validated['location'],
            'estado' => $validated['status'],
        ]);

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
        $today = now()->toDateString();
        return $evento->fecha_inicio <= $today && $evento->fecha_fin >= $today;
    }
}
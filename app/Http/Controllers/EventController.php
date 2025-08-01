<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
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

        Evento::create([
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

        return redirect()->route('dashboard_academico')
            ->with('success', 'Evento actualizado exitosamente');
    }

    public function destroy(Evento $event): RedirectResponse
    {
        $event->delete();

        return redirect()->route('dashboard_academico')
            ->with('success', 'Evento eliminado exitosamente');
    }
}
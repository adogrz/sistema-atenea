<?php

namespace App\Http\Controllers;

use App\Models\InternadoPeriodo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InternadoPeriodoController extends Controller
{
    /**
     * Mostrar lista de periodos
     */
    public function periodos(): Response
    {
        $periodos = InternadoPeriodo::withCount(['asistencias', 'conductas'])
            ->ordenado()
            ->get()
            ->map(function ($periodo) {
                return [
                    'id' => $periodo->id,
                    'nombre' => $periodo->nombre,
                    'fecha_inicio' => $periodo->fecha_inicio->format('d/m/Y'),
                    'fecha_fin' => $periodo->fecha_fin->format('d/m/Y'),
                    'descripcion' => $periodo->descripcion,
                    'activo' => $periodo->activo,
                    'es_vigente' => $periodo->es_vigente,
                    'total_asistencias' => $periodo->asistencias_count,
                    'total_conductas' => $periodo->conductas_count,
                ];
            });

        return Inertia::render('fdtc/periods/periods-list', [
            'periodos' => $periodos,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('fdtc/periods/create-period');
    }

    /**
     * Crear nuevo periodo
     */
    public function store(Request $request)
    {
        try {
            InternadoPeriodo::create($request->all());
            return redirect()->route('internado-fdtc.periodos')->with('success', 'Periodo creado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al crear periodo: ' . $e->getMessage());
        }
    }

    public function edit(InternadoPeriodo $periodo): Response
    {
        $periodo->load(['asistencias', 'conductas']);
        
        return Inertia::render('fdtc/periods/edit-period', [
            'periodo' => [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_inicio' => $periodo->fecha_inicio->format('Y-m-d'),
                'fecha_fin' => $periodo->fecha_fin->format('Y-m-d'),
                'descripcion' => $periodo->descripcion,
                'activo' => $periodo->activo,
                'es_vigente' => $periodo->es_vigente,
                'total_asistencias' => $periodo->asistencias->count(),
                'total_conductas' => $periodo->conductas->count(),
            ],
        ]);
    }

    /**
     * Actualizar periodo
     */
    public function update(Request $request, InternadoPeriodo $periodo)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean',
        ]);

        try {
            $periodo->update($request->all());
            return redirect()->route('internado-fdtc.periodos')->with('success', 'Periodo actualizado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar periodo: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar periodo
     */
    public function destroy(InternadoPeriodo $periodo)
    {
        try {
            $periodo->delete();
            return redirect()->back()->with('success', 'Periodo eliminado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar periodo: ' . $e->getMessage());
        }
    }

    /**
     * Activar/desactivar periodo
     */
    public function toggleActivo(InternadoPeriodo $periodo)
    {
        try {
            $periodo->update(['activo' => !$periodo->activo]);
            $estado = $periodo->activo ? 'activado' : 'desactivado';
            return redirect()->back()->with('success', "Periodo {$estado} exitosamente");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al cambiar estado: ' . $e->getMessage());
        }
    }
}
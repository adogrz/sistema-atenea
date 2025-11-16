<?php

namespace App\Http\Controllers;

use App\Models\DefinicionEvaluacion;
use App\Models\FaseOlimpiada;
use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\DB;

class FaseOlimpiadaController extends Controller
{
    
    public function store(Request $request, Olimpiada $olimpiada)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:120'],
            'orden' => ['required', 'integer', 'min:1'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'activa' => ['required', 'boolean'],
            'observaciones' => ['nullable', 'string'],
            'cupos' => ['required', 'integer', 'min:1'],
            'definicion_evaluacion_id' => ['nullable', 'integer', 'exists:definiciones_evaluacion,id'],
        ]);

        // Check for unique order within the same olympiad
        $exists = $olimpiada->fases()->where('orden', $validated['orden'])->exists();

        if ($exists) {
            return back()->withErrors(['orden' => 'El número de orden ya existe para esta olimpiada.'])->withInput();
        }

        $fase = $olimpiada->fases()->create($validated);
        activity()->performedOn($fase)->log('Fase de Olimpiada creada');

        return redirect()->back()->with('success', 'Fase creada exitosamente.');
    }

    public function update(Request $request, FaseOlimpiada $fase)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:120'],
            'orden' => ['required', 'integer', 'min:1'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'activa' => ['required', 'boolean'],
            'observaciones' => ['nullable', 'string'],
            'cupos' => ['required', 'integer', 'min:1'],
            'definicion_evaluacion_id' => ['nullable', 'integer', 'exists:definiciones_evaluacion,id'],
        ]);

        // Check for unique order within the same olympiad, excluding the current phase
        $exists = FaseOlimpiada::where('olimpiada_id', $fase->olimpiada_id)
            ->where('orden', $validated['orden'])
            ->where('id', '!=', $fase->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['orden' => 'El número de orden ya existe para esta olimpiada.'])->withInput();
        }
        $fase->update($validated);
        activity()->performedOn($fase)->log('Fase de Olimpiada actualizada');

        return redirect()->back()->with('success', 'Fase actualizada exitosamente.');
    }

    public function updateDetails(Request $request, FaseOlimpiada $fase)
    {
        $validated = $request->validate([
            'cupos' => ['sometimes', 'required', 'integer', 'min:0'],
        ]);

        $fase->update($validated);
        activity()->performedOn($fase)->log('Detalles de Fase de Olimpiada actualizados');

        return redirect()->back()->with('success', 'Fase actualizada exitosamente.');
    }

    public function destroy(FaseOlimpiada $fase)
    {
        try {
            activity()->performedOn($fase)->log('Fase de Olimpiada eliminada');
            $fase->delete();
            return redirect()->back()->with('success', 'Fase eliminada exitosamente.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'No se puede eliminar la fase porque tiene registros asociados.');
        }
    }

    public function reorder(Request $request, FaseOlimpiada $fase)
    {
        $request->validate([
            'direction' => ['required', 'string', 'in:up,down'],
        ]);

        $direction = $request->input('direction');
        $currentOrder = $fase->orden;

        DB::transaction(function () use ($fase, $direction, $currentOrder) {
            if ($direction === 'up') {
                $other = FaseOlimpiada::where('olimpiada_id', $fase->olimpiada_id)
                    ->where('orden', '<', $currentOrder)
                    ->orderBy('orden', 'desc')
                    ->first();
            } else { // down
                $other = FaseOlimpiada::where('olimpiada_id', $fase->olimpiada_id)
                    ->where('orden', '>', $currentOrder)
                    ->orderBy('orden', 'asc')
                    ->first();
            }

            if ($other) {
                $fase->update(['orden' => $other->orden]);
                $other->update(['orden' => $currentOrder]);
                activity()->performedOn($fase)->log('Fase de Olimpiada reordenada');
            }
        });

        return redirect()->back()->with('success', 'Fase reordenada exitosamente.');
    }

    public function assignEvaluation(Request $request, FaseOlimpiada $fase)
    {
        $validated = $request->validate([
            'definicion_evaluacion_id' => ['nullable', 'integer', 'exists:definiciones_evaluacion,id'],
        ]);

        $fase->update($validated);
        activity()->performedOn($fase)->log('Evaluación asignada a Fase de Olimpiada');

        // Generate evaluations for all inscriptions when an evaluation definition is assigned
        if ($validated['definicion_evaluacion_id']) {
            $this->generateEvaluationsForPhase($fase);
        }

        return redirect()->back()->with('success', 'Evaluación asignada exitosamente.');
    }

    public function showResults(FaseOlimpiada $fase)
    {
        $fase->load(['evaluaciones.inscripcion.estudiante', 'olimpiada']);

        $notaMinima = $fase->nota_minima_aprobacion;

        $resultados = $fase->evaluaciones->map(function ($evaluacion) use ($notaMinima) {
            $aprobado = $evaluacion->total_puntaje >= $notaMinima;
            return [
                'estudiante' => $evaluacion->inscripcion->estudiante,
                'puntaje' => $evaluacion->total_puntaje,
                'aprobado' => $aprobado,
            ];
        });

        return Inertia::render('Olimpiadas/Resultados', [
            'fase' => $fase,
            'resultados' => $resultados,
        ]);
    }

    public function getPhaseDetails(FaseOlimpiada $fase)
    {
        $faseDetails = FaseOlimpiada::with([
            'definicionEvaluacion' => function ($query) {
                $query->with(['itemsDefinidos' => function ($q) {
                    $q->with(['calificadores' => function ($q2) {
                        $q2->select('users.id', 'users.name');
                    }]);
                }]);
            },
            'olimpiada' // Ensure olimpiada is loaded for context
        ])->find($fase->id);

        if (!$faseDetails) {
            return response()->json(['message' => 'Fase no encontrada.'], 404);
        }

        return response()->json($faseDetails);
    }

    /**
     * Genera las evaluaciones para todas las inscripciones de una fase
     */
    private function generateEvaluationsForPhase(FaseOlimpiada $fase): void
    {
        // Load the phase with its evaluation definition and items
        $fase->load('definicionEvaluacion.itemsDefinidos');

        // Get all inscriptions for this olympiad
        $inscripciones = \App\Models\InscripcionOlimpiada::where('olimpiada_id', $fase->olimpiada_id)->get();

        foreach ($inscripciones as $inscripcion) {
            // Create or get the evaluation for this inscription and phase
            $evaluacion = \App\Models\Evaluacion::firstOrCreate(
                [
                    'inscripcion_id' => $inscripcion->id,
                    'fase_olimpiada_id' => $fase->id,
                ],
                [
                    'total_puntaje' => 0,
                ]
            );

            // If there's an evaluation definition, create ItemEvaluado records
            if ($fase->definicionEvaluacion && $fase->definicionEvaluacion->itemsDefinidos->isNotEmpty()) {
                foreach ($fase->definicionEvaluacion->itemsDefinidos as $item) {
                    \App\Models\ItemEvaluado::firstOrCreate(
                        [
                            'evaluacion_id' => $evaluacion->id,
                            'item_definido_id' => $item->id,
                        ],
                        [
                            'puntaje' => 0,
                        ]
                    );
                }
            }
        }
    }
}

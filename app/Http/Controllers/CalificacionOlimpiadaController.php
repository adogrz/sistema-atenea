<?php

namespace App\Http\Controllers;

use App\Models\CalificadorItemAsignado;
use App\Models\Evaluacion;
use App\Models\FaseOlimpiada;
use App\Models\InscripcionOlimpiada;
use App\Models\ItemDefinido;
use App\Models\ItemEvaluado;
use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CalificacionOlimpiadaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Find all phases where the current user has assigned items
        $faseIds = CalificadorItemAsignado::where('calificador_id', $user->id)
            ->distinct()
            ->pluck('fase_olimpiada_id');

        // Get all evaluations from those phases with nested relations
        $evaluaciones = Evaluacion::with([
                'inscripcion.estudiante.user',
                'faseOlimpiada.olimpiada'
            ])
            ->whereIn('fase_olimpiada_id', $faseIds)
            ->get()
            ->map(function ($evaluacion) {
                $evaluacion->status_text = $evaluacion->finalizada_at ? 'Finalizada' : 'Pendiente';
                return $evaluacion;
            });

        return Inertia::render('dashboard-calificador', [
            'evaluaciones' => $evaluaciones,
        ]);
    }

    public function edit(Evaluacion $evaluacion)
    {
        $evaluacion->load(['inscripcion.estudiante', 'faseOlimpiada.definicionEvaluacion.itemsDefinidos']);

        // Get the IDs of items assigned to the current grader for this specific phase
        $assignedItemIds = CalificadorItemAsignado::where('calificador_id', Auth::id())
            ->where('fase_olimpiada_id', $evaluacion->fase_olimpiada_id)
            ->pluck('item_definido_id');

        // Get all evaluated items for this evaluation, but we will only allow editing for assigned ones on the frontend
        $itemsEvaluados = ItemEvaluado::where('evaluacion_id', $evaluacion->id)
            ->with('itemDefinido')
            ->get();

        return Inertia::render('Olimpiadas/ScoreEntry', [
            'evaluacion' => $evaluacion,
            'itemsEvaluados' => $itemsEvaluados,
            'assignedItemIds' => $assignedItemIds,
        ]);
    }

    public function update(Request $request, Evaluacion $evaluacion)
    {
        $validated = $request->validate([
            'scores' => ['required', 'array'],
            'scores.*.item_evaluado_id' => ['required', 'integer', 'exists:items_evaluados,id'],
            'scores.*.puntaje' => ['required', 'numeric', 'min:0', 'max:10'],
        ], [
            'scores.*.puntaje.required' => 'El puntaje es obligatorio.',
            'scores.*.puntaje.max' => 'El puntaje no puede ser mayor a 10.',
            'scores.*.puntaje.min' => 'El puntaje no puede ser negativo.',
            'scores.*.puntaje.numeric' => 'El puntaje debe ser un número.',
        ]);

        // Get the IDs of items assigned to the current grader for this specific phase
        $assignedItemIds = CalificadorItemAsignado::where('calificador_id', Auth::id())
            ->where('fase_olimpiada_id', $evaluacion->fase_olimpiada_id)
            ->pluck('item_definido_id')
            ->flip(); // Flip for efficient O(1) lookups

        DB::transaction(function () use ($validated, $assignedItemIds, $evaluacion) {
            foreach ($validated['scores'] as $scoreData) {
                $itemEvaluado = ItemEvaluado::find($scoreData['item_evaluado_id']);

                if (!$itemEvaluado) {
                    continue; // Skip if item doesn't exist
                }

                // Security Check: Ensure the item being updated is actually assigned to this grader
                if ($assignedItemIds->has($itemEvaluado->item_definido_id)) {
                    // Convert to float and ensure it's a valid number
                    $puntaje = is_numeric($scoreData['puntaje']) ? floatval($scoreData['puntaje']) : 0;
                    
                    // Ensure puntaje is not NaN or Inf
                    if (!is_finite($puntaje)) {
                        $puntaje = 0;
                    }
                    
                    $maxScore = min($itemEvaluado->itemDefinido->puntaje_maximo, 10);
                    if ($puntaje > $maxScore) {
                        $puntaje = $maxScore;
                    }
                    
                    // Ensure puntaje is between 0 and maxScore
                    $puntaje = max(0, min($puntaje, $maxScore));
                    
                    $itemEvaluado->update(['puntaje' => $puntaje]);
                }
            }

            // Recalculate total score for the main Evaluation record
            $evaluacion->total_puntaje = $evaluacion->itemsEvaluados()->sum('puntaje');
            $evaluacion->save();
        });

        return redirect()->route('calificaciones.olimpiadas.index')->with('success', 'Calificaciones guardadas exitosamente.');
    }

    public function updateInline(Request $request)
    {
        $data = $request->validate([
            'inscripcion_id' => ['required', 'integer', 'exists:inscripciones_olimpiadas,id'],
            'fase_id' => ['required', 'integer', 'exists:fases_olimpiadas,id'],
            'item_definido_id' => ['required', 'integer', 'exists:items_definidos,id'],
            'puntaje' => ['nullable', 'numeric', 'min:0'],
        ]);

        $itemDefinido = ItemDefinido::find($data['item_definido_id']);
        if (!$itemDefinido) {
            return response()->json(['error' => 'Item definido no encontrado.'], 404);
        }

        // Check if the current user is assigned to grade this item in this phase
        $isAssigned = CalificadorItemAsignado::where('calificador_id', Auth::id())
            ->where('fase_olimpiada_id', $data['fase_id'])
            ->where('item_definido_id', $itemDefinido->id)
            ->exists();

        if (!$isAssigned) {
            return response()->json(['error' => 'No tienes permiso para calificar este ítem.'], 403);
        }

        if ($data['puntaje'] > $itemDefinido->puntaje_maximo) {
            return response()->json(['error' => 'El puntaje excede el máximo permitido.'], 422);
        }

        // Find or create the main Evaluation record
        $evaluacion = Evaluacion::firstOrCreate([
            'inscripcion_id' => $data['inscripcion_id'],
            'fase_olimpiada_id' => $data['fase_id'],
        ], [
            'calificador_id' => Auth::id(),
        ]);

        // Update or create the specific ItemEvaluado record
        ItemEvaluado::updateOrCreate(
            [
                'evaluacion_id' => $evaluacion->id,
                'item_definido_id' => $data['item_definido_id'],
            ],
            [
                'puntaje' => $data['puntaje'],
            ]
        );

        // Recalculate total score for the main Evaluation record
        $total = ItemEvaluado::where('evaluacion_id', $evaluacion->id)->sum('puntaje');
        $evaluacion->total_puntaje = $total;
        $evaluacion->save();

        return response()->json(['success' => true, 'total' => $total]);
    }
}

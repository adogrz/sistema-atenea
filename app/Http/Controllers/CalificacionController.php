<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\CalificadorItemAsignado;
use App\Models\ItemEvaluado;

class CalificacionController extends Controller
{
    public function index()
    {
        $grader = Auth::user();

        $assignedItems = CalificadorItemAsignado::where('calificador_id', $grader->id)
            ->with(['itemDefinido.faseOlimpiada.olimpiada', 'itemDefinido.faseOlimpiada.inscripciones.estudiante'])
            ->get();

        $assignments = $assignedItems->map(function ($assignment) {
            $fase = $assignment->itemDefinido->faseOlimpiada;
            $students = $fase->inscripciones->map(function ($inscripcion) use ($assignment) {
                $student = $inscripcion->estudiante;
                $evaluacion = $student->evaluaciones()->where('fase_olimpiada_id', $fase->id)->first();
                $score = null;
                if ($evaluacion) {
                    $itemEvaluado = $evaluacion->itemsEvaluados()->where('item_definido_id', $assignment->item_definido_id)->first();
                    $score = $itemEvaluado ? $itemEvaluado->puntaje : null;
                }
                return [
                    'id' => $student->id,
                    'nombre_completo' => $student->nombre_completo,
                    'evaluacion_id' => $evaluacion ? $evaluacion->id : null,
                    'score' => $score,
                ];
            });

            return [
                'item_definido_id' => $assignment->item_definido_id,
                'item_nombre' => $assignment->itemDefinido->nombre,
                'fase_nombre' => $fase->nombre,
                'olimpiada_nombre' => $fase->olimpiada->nombre,
                'puntos_maximos' => $assignment->itemDefinido->puntos_maximos,
                'students' => $students,
            ];
        });

        return Inertia::render('Calificaciones/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'scores' => 'required|array',
            'scores.*.evaluacion_id' => 'required|integer|exists:evaluacions,id',
            'scores.*.item_definido_id' => 'required|integer|exists:items_definidos,id',
            'scores.*.score' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated['scores'] as $scoreData) {
            ItemEvaluado::updateOrCreate(
                [
                    'evaluacion_id' => $scoreData['evaluacion_id'],
                    'item_definido_id' => $scoreData['item_definido_id'],
                ],
                ['puntaje' => $scoreData['score']]
            );
        }

        return redirect()->back()->with('success', 'Calificaciones guardadas exitosamente.');
    }
}

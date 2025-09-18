<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Models\FaseOlimpiada;
use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $areaId = $user->area_id;

        $olimpiadas = Olimpiada::where('area_id', $areaId)->with('fases')->get();

        $selectedFase = null;
        $faseDetails = [];

        if ($request->has('fase_id')) {
            $selectedFase = FaseOlimpiada::with('olimpiada')->findOrFail($request->fase_id);

            // Security check: ensure the phase belongs to the user's area
            if ($selectedFase->olimpiada->area_id != $areaId) {
                abort(403);
            }

            $inscripciones = $selectedFase->inscripciones()->with('estudiante')->get();
            $totalInscripciones = $inscripciones->count();
            
            $evaluacionesCompletadas = 0;
            $itemsDefinidosCount = $selectedFase->definicionEvaluacion->itemsDefinidos->count();

            foreach ($inscripciones as $inscripcion) {
                $evaluacion = Evaluacion::where('inscripcion_id', $inscripcion->id)->first();
                if ($evaluacion) {
                    $itemsEvaluadosCount = $evaluacion->itemsEvaluados->count();
                    if ($itemsEvaluadosCount >= $itemsDefinidosCount) {
                        $evaluacionesCompletadas++;
                    }
                }
            }

            $faseDetails = [
                'inscripciones' => $inscripciones,
                'total_inscripciones' => $totalInscripciones,
                'evaluaciones_completadas' => $evaluacionesCompletadas,
            ];
        }

        return Inertia::render('Area/Dashboard', [
            'olimpiadas' => $olimpiadas,
            'selectedFase' => $selectedFase,
            'faseDetails' => $faseDetails,
        ]);
    }
}

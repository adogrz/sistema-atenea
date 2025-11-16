<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Models\FaseOlimpiada;
use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AreaDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $primaryArea = $user->primaryArea();
        $areaId = 1;//$primaryArea ? $primaryArea->id : null;

        if (!$areaId) {
            return Inertia::render('Area/Dashboard', [
                'olimpiadasWithStats' => [],
            ]);
        }

        $olimpiadas = Olimpiada::where('area_id', $areaId)
            ->with(['fases.evaluaciones.itemsEvaluados', 'fases.definicionEvaluacion.itemsDefinidos'])
            ->get();


        $availableYears = $olimpiadas->map(function ($olimpiada) {
            return $olimpiada->created_at->year;
        })->unique()->sortDesc()->values();

        $olimpiadasWithStats = $olimpiadas->map(function ($olimpiada) {
            $fasesWithStats = $olimpiada->fases->map(function ($fase) {
                $totalParticipantes = $fase->evaluaciones->count();
                $itemsDefinidosCount = $fase->definicionEvaluacion ? $fase->definicionEvaluacion->itemsDefinidos->count() : 0;
                $evaluacionesCompletadas = 0;

                if ($itemsDefinidosCount > 0) {
                    foreach ($fase->evaluaciones as $evaluacion) {
                        if ($evaluacion->itemsEvaluados->count() >= $itemsDefinidosCount) {
                            $evaluacionesCompletadas++;
                        }
                    }
                }

                return [
                    'id' => $fase->id,
                    'nombre' => $fase->nombre,
                    'total_inscripciones' => $totalParticipantes,
                    'evaluaciones_completadas' => $evaluacionesCompletadas,
                    'progreso' => $totalParticipantes > 0 ? round(($evaluacionesCompletadas / $totalParticipantes) * 100) : 0,
                    'resultados_publicados' => $fase->resultados_publicados ?? false,
                ];
            });

            return [
                'id' => $olimpiada->id,
                'nombre' => $olimpiada->nombre,
                'year' => $olimpiada->created_at->year,
                'fases' => $fasesWithStats,
            ];
        });

        //dump($olimpiadasWithStats);
        return Inertia::render('Area/Dashboard', [
            'olimpiadasWithStats' => $olimpiadasWithStats,
            'availableYears' => $availableYears,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Olimpiada;
use App\Models\FaseOlimpiada;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Auth;

class ResultadoController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $query = Olimpiada::query();

        if ($user->hasRole('coordinador-area')) {
            $primaryArea = $user->primaryArea();
            if ($primaryArea) {
                $query->where('area_id', $primaryArea->id);
            }
        }

        $olimpiadas = $query->with(['area', 'nivelEducativo', 'fases' => function ($query) {
            $query->with('definicionEvaluacion.itemsDefinidos')->orderBy('orden');
        }])->get();

        return Inertia::render('Resultados/Index', [
            'olimpiadas' => $olimpiadas,
        ]);
    }

    public function getResultsForFase(FaseOlimpiada $fase)
    {
        $this->authorize('view', $fase->olimpiada);
        $results = $this->getFaseResults($fase);
        return response()->json($results);
    }

    public function managementIndex(): Response
    {
        $user = Auth::user();
        $query = Olimpiada::query();

        if ($user->hasRole('coordinador-area')) {
            $primaryArea = $user->primaryArea();
            if ($primaryArea) {
                $query->where('area_id', $primaryArea->id);
            }
        }

        $olimpiadas = $query->with(['area', 'nivelEducativo', 'fases' => function ($query) {
            $query->with('definicionEvaluacion.itemsDefinidos')->orderBy('orden');
        }])->get();

        return Inertia::render('Resultados/Management', [
            'olimpiadas' => $olimpiadas,
        ]);
    }

    private function getFaseResults(FaseOlimpiada $fase)
    {
        // Eager load necessary relationships for evaluations
        $fase->load([
            'evaluaciones.inscripcion.estudiante.user',
            'evaluaciones.itemsEvaluados.itemDefinido',
            'evaluaciones.itemsEvaluados.calificador', // Load calificador for each item
        ]);

        $notaMinima = $fase->nota_minima_aprobacion ?? 0;
        $cupos = $fase->cupos ?? 0;
        $maxScore = $fase->definicionEvaluacion ? $fase->definicionEvaluacion->itemsDefinidos->sum('puntos_maximos') : 0;

        $resultados = $fase->evaluaciones->map(function ($evaluacion) use ($fase, $maxScore, $notaMinima) {
            if (!$evaluacion->inscripcion || !$evaluacion->inscripcion->estudiante) return null;

            $estudiante = $evaluacion->inscripcion->estudiante;
            $totalScore = $evaluacion->itemsEvaluados->sum('puntaje');

            return [
                'evaluacion_id' => $evaluacion->id,
                'olimpiada_id' => $fase->olimpiada_id,
                'fase_id' => $fase->id,
                'fase_nombre' => $fase->nombre,
                'olimpiada_nombre' => $fase->olimpiada->nombre,
                'estudiante_codigo' => $estudiante->codigo,
                'estudiante_nombre' => $estudiante->nombre_completo,
                'estudiante_email' => $estudiante->user->email,
                'total_score' => $totalScore,
                'max_score' => $maxScore,
                'percentage_score' => $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 2) : 0,
                'aprobado' => $totalScore >= $notaMinima,
                'nota_minima' => $notaMinima,
                'pasa_siguiente_fase' => false,
            ];
        })->filter()->sortByDesc('total_score')->values();

        $passedCount = 0;
        return $resultados->map(function ($resultado) use ($cupos, &$passedCount) {
            if ($resultado['aprobado']) {
                if ($cupos > 0 && $passedCount < $cupos) {
                    $resultado['pasa_siguiente_fase'] = true;
                    $passedCount++;
                } elseif ($cupos === 0) {
                    $resultado['pasa_siguiente_fase'] = true;
                }
            }
            return $resultado;
        });
    }
}


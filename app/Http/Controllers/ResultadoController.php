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
    public function index(Request $request): Response
    {
        $olimpiadas = Olimpiada::with('area')->get();
        $fases = FaseOlimpiada::with('olimpiada')->get();
        
        $resultados = null;
        $initialOlimpiadaId = $request->query('olimpiada_id');
        $initialFaseId = $request->query('fase_id');

        if ($initialFaseId) {
            $fase = FaseOlimpiada::with('olimpiada')->findOrFail($initialFaseId);
            $this->authorize('view', $fase->olimpiada);
            $resultados = $this->getFaseResults($fase);
        }

        return Inertia::render('Olimpiadas/Resultados/Index', [
            'olimpiadas' => $olimpiadas,
            'fases' => $fases,
            'resultados' => $resultados,
            'initialOlimpiadaId' => $initialOlimpiadaId,
            'initialFaseId' => $initialFaseId,
        ]);
    }

    private function getFaseResults(FaseOlimpiada $fase)
    {
        // Eager load necessary relationships for evaluations
        $fase->load([
            'evaluaciones.inscripcion.estudiante.user',
            'evaluaciones.itemsEvaluados.itemDefinido',
        ]);

        $notaMinima = $fase->nota_minima_aprobacion ?? 0;

        $resultados = $fase->evaluaciones->map(function ($evaluacion) use ($notaMinima) {
            if (!$evaluacion->inscripcion || !$evaluacion->inscripcion->estudiante) {
                return null;
            }

            $totalScore = $evaluacion->itemsEvaluados->sum('puntaje');

            return (object) [
                'estudiante' => (object) [
                    'codigo' => $evaluacion->inscripcion->estudiante->codigo,
                    'nombre_completo' => $evaluacion->inscripcion->estudiante->nombre_completo,
                    'user_id' => $evaluacion->inscripcion->estudiante->user_id,
                ],
                'puntaje' => $totalScore,
                'aprobado' => $totalScore >= $notaMinima,
            ];
        })->filter()->sortByDesc('puntaje')->values()->all();

        return $resultados;
    }
    
    public function getResultsForFase(FaseOlimpiada $fase)
    {
        $this->authorize('view', $fase->olimpiada);
        $results = $this->getFaseResults($fase);
        return response()->json($results);
    }




}


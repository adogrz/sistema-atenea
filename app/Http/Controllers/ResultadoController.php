<?php

namespace App\Http\Controllers;

use App\Models\Olimpiada;
use App\Models\FaseOlimpiada;
use App\Models\Area;
use App\Models\NivelEducativo;
use App\Models\Estudiante; // Add this line
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResultadoController extends Controller
{
    public function index(Request $request): Response
    {
        $olimpiadas = Olimpiada::with('area', 'nivelEducativo')->get();
        $areas = Area::all();
        $nivelesEducativos = NivelEducativo::all();

        $selectedOlimpiadaId = $request->input('olimpiada_id');
        $selectedFaseId = $request->input('fase_id');

        $fasesForDropdown = collect();
        $resultados = collect();
        $selectedFaseCupos = 0;

        $queryOlimpiadas = Olimpiada::with('fases');

        if ($selectedOlimpiadaId && $selectedOlimpiadaId !== 'all') {
            $queryOlimpiadas->where('id', $selectedOlimpiadaId);
        }

        $filteredOlimpiadas = $queryOlimpiadas->get();

        if ($filteredOlimpiadas->isNotEmpty()) {
            foreach ($filteredOlimpiadas as $olimpiada) {
                $olimpiadaFases = $olimpiada->fases()->orderBy('orden')->get();
                $fasesForDropdown = $fasesForDropdown->concat($olimpiadaFases);

                if ($selectedFaseId && $selectedFaseId !== 'all') {
                    $fase = $olimpiadaFases->where('id', $selectedFaseId)->first();
                    if ($fase) {
                        $resultados = $resultados->concat($this->getFaseResults($fase));
                        $selectedFaseCupos = $fase->cupos ?? 0;
                    }
                } else {
                    foreach ($olimpiadaFases as $fase) {
                        $resultados = $resultados->concat($this->getFaseResults($fase));
                    }
                }
            }
        }

        return Inertia::render('Resultados/Index', [
            'olimpiadas' => $olimpiadas,
            'fases' => $fasesForDropdown->unique('id')->values()->all(),
            'areas' => $areas,
            'nivelesEducativos' => $nivelesEducativos,
            'selectedOlimpiadaId' => $selectedOlimpiadaId,
            'selectedFaseId' => $selectedFaseId,
            'resultados' => $resultados->values()->all(),
            'selectedFaseCupos' => $selectedFaseCupos,
        ]);
    }

    public function getEmailsForPassedStudents(Request $request)
    {
        $request->validate([
            'olimpiada_id' => ['required', 'integer', 'exists:olimpiadas,id'],
            'fase_id' => ['required', 'integer', 'exists:fases_olimpiadas,id'],
        ]);

        $olimpiadaId = $request->input('olimpiada_id');
        $faseId = $request->input('fase_id');

        $fase = FaseOlimpiada::where('olimpiada_id', $olimpiadaId)->find($faseId);

        if (!$fase) {
            return response()->json(['message' => 'Fase not found.'], 404);
        }

        $resultados = $this->getFaseResults($fase);

        $emails = $resultados->filter(function ($resultado) {
            return $resultado['pasa_siguiente_fase'];
        })->map(function ($resultado) {
            $estudiante = Estudiante::where('user_id', $resultado['estudiante_id'])->first();
            return $estudiante ? $estudiante->email : null;
        })->filter()->unique()->values()->all();

        return response()->json(['emails' => $emails]);
    }

    private function getFaseResults(FaseOlimpiada $fase)
    {
        $fase->load(['evaluaciones.estudiante', 'evaluaciones.itemsEvaluados', 'definicionEvaluacion.itemsDefinidos']);

        $resultados = collect();
        $notaMinima = $fase->nota_minima_aprobacion ?? 0;
        $cupos = $fase->cupos ?? 0;

        foreach ($fase->evaluaciones as $evaluacion) {
            $totalScore = $evaluacion->itemsEvaluados->sum('puntaje_obtenido');
            $maxScore = $fase->definicionEvaluacion ? $fase->definicionEvaluacion->itemsDefinidos->sum('puntos_maximos') : 0;

            $resultados->push([
                'evaluacion_id' => $evaluacion->id,
                'fase_id' => $fase->id,
                'fase_nombre' => $fase->nombre,
                'olimpiada_nombre' => $fase->olimpiada->nombre, // Assuming olimpiada is loaded
                'estudiante_id' => $evaluacion->estudiante->id,
                'estudiante_nombre' => $evaluacion->estudiante->nombre . ' ' . $evaluacion->estudiante->apellido,
                'total_score' => $totalScore,
                'max_score' => $maxScore,
                'percentage_score' => $maxScore > 0 ? round(($totalScore / $maxScore) * 100, 2) : 0,
                'aprobado' => $totalScore >= $notaMinima,
                'nota_minima' => $notaMinima,
            ]);
        }

        // Sort results by total_score in descending order for quota calculation
        $resultados = $resultados->sortByDesc('total_score');

        // Determine who passes based on quota
        if ($cupos > 0) {
            $resultados = $resultados->map(function ($resultado, $key) use ($cupos) {
                $pasa = ($key < $cupos) && $resultado['aprobado'];
                if ($pasa) {
                    $estudiante = Estudiante::where('user_id', $resultado['estudiante_id'])->first();
                    if ($estudiante && !$estudiante->aprobado) {
                        $estudiante->generateAndAssignPermanentCode();
                    }
                }
                $resultado['pasa_siguiente_fase'] = $pasa;
                return $resultado;
            });
        } else {
            $resultados = $resultados->map(function ($resultado) {
                if ($resultado['aprobado']) {
                    $estudiante = Estudiante::where('user_id', $resultado['estudiante_id'])->first();
                    if ($estudiante && !$estudiante->aprobado) {
                        $estudiante->generateAndAssignPermanentCode();
                    }
                }
                $resultado['pasa_siguiente_fase'] = $resultado['aprobado'];
                return $resultado;
            });
        }

        return $resultados;
    }
}

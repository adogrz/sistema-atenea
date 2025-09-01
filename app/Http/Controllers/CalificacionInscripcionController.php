<?php

namespace App\Http\Controllers;

use App\Models\EvaluacionFase;
use App\Models\InscripcionOlimpiada;
use App\Models\ItemDefinido;
use App\Models\ItemEvaluado;
use App\Services\ClaimService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CalificacionInscripcionController extends Controller
{
    protected $claimService;

    public function __construct(ClaimService $claimService)
    {
        $this->claimService = $claimService;
        // $this->middleware(['auth', 'verified', 'role:calificador']);
    }

    /**
     * Dashboard de calificador: 3 colas (ya calificadas, reclamadas, no reclamadas).
     */
    public function index(): Response
    {
        $user = Auth::user();
        $areaIds = $this->areaIdsDelCalificador();

        // 1. Ya calificadas
        $yaCalificadas = EvaluacionFase::with(['inscripcion.participante', 'inscripcion.fase.olimpiada'])
            ->where('calificador_id', $user->id)
            ->where('estado', 'finalizado')
            ->whereHas('inscripcion.fase.olimpiada', fn($q) => $q->whereIn('area_id', $areaIds))
            ->orderByDesc('updated_at')
            ->get();

        // 2. Reclamadas
        $reclamadas = EvaluacionFase::with(['inscripcion.participante', 'inscripcion.fase.olimpiada'])
            ->where('calificador_id', $user->id)
            ->where('estado', 'en_proceso')
            ->whereHas('inscripcion.fase.olimpiada', fn($q) => $q->whereIn('area_id', $areaIds))
            ->orderByDesc('updated_at')
            ->get();

        // 3. No reclamadas
        $noReclamadas = InscripcionOlimpiada::with(['participante', 'fase.olimpiada'])
            ->whereHas('fase.olimpiada', fn($q) => $q->whereIn('area_id', $areaIds))
            ->whereDoesntHave('evaluacionesFase', fn($q) => $q->where('calificador_id', $user->id))
            ->latest('id')
            ->get();

        return Inertia::render('dashboard-calificador', [
            'yaCalificadas' => $yaCalificadas,
            'reclamadas'    => $reclamadas,
            'noReclamadas'  => $noReclamadas,
            'stats'         => [
                'finalizadas' => $yaCalificadas->count(),
                'enProceso'   => $reclamadas->count(),
                'disponibles' => $noReclamadas->count(),
            ],
        ]);
    }

    /**
     * Reclama una inscripción (claim): solo si no la tiene otro calificador activa.
     */
    public function claim(InscripcionOlimpiada $inscripcion)
    {
        $this->abortIfInscripcionFueraDeMisAreas($inscripcion);
        $user = Auth::user();

        // Crea/obtiene evaluación
        $evaluacion = EvaluacionFase::firstOrCreate(
            [
                'fase_olimpiada_id' => $inscripcion->fase_id,
                'inscripcion_id'    => $inscripcion->id,
                'calificador_id'    => $user->id,
            ],
            [
                'estado' => 'en_proceso',
                'total'  => 0,
            ]
        );

        // Intenta reclamar usando ClaimService
        try {
            $this->claimService->claim(
                $evaluacion->id,
                $inscripcion->id,
                $user->id
            );
        } catch (\Illuminate\Database\QueryException $e) {
            // Ya hay claim activo, mostrar error
            return back()->withErrors(['error' => 'La inscripción ya está siendo calificada por otro usuario.']);
        }

        return redirect()
            ->route('calificaciones.inscripciones.edit', $inscripcion)
            ->with('success', 'Inscripción reclamada exitosamente.');
    }

    /**
     * Formulario de calificación. Solo el que tiene claim activo puede editar.
     */
    public function edit(InscripcionOlimpiada $inscripcion): Response
    {
        $this->abortIfInscripcionFueraDeMisAreas($inscripcion);
        $user = Auth::user();

        // Obtiene o crea evaluación
        $evaluacion = EvaluacionFase::firstOrCreate(
            [
                'fase_olimpiada_id' => $inscripcion->fase_id,
                'inscripcion_id'    => $inscripcion->id,
                'calificador_id'    => $user->id,
            ],
            [
                'estado' => 'en_proceso',
                'total'  => 0,
            ]
        );

        // Solo permite editar si tienes el claim activo
        if (!$this->claimService->tieneClaimActivo($evaluacion->id, $user->id)) {
            abort(403, 'No tienes permiso para calificar esta inscripción. Reclámala primero.');
        }

        $inscripcion->load(['participante', 'fase.olimpiada']);

        $items = ItemDefinido::where('fase_olimpiada_id', $inscripcion->fase_id)
            ->orderBy('orden')->orderBy('id')
            ->get(['id', 'nombre', 'descripcion', 'puntaje_maximo', 'fase_olimpiada_id', 'orden']);

        $calificaciones = ItemEvaluado::where('evaluacion_fase_id', $evaluacion->id)
            ->get(['id', 'item_definido_id', 'puntaje', 'observacion'])
            ->keyBy('item_definido_id');

        return Inertia::render('Calificador/CalificarInscripcion', [
            'inscripcion'    => $inscripcion,
            'items'          => $items,
            'evaluacion'     => $evaluacion->only(['id', 'estado', 'total']),
            'calificaciones' => $calificaciones,
        ]);
    }

    /**
     * Guarda notas y libera claim al finalizar.
     */
    public function update(Request $request, InscripcionOlimpiada $inscripcion)
    {
        $this->abortIfInscripcionFueraDeMisAreas($inscripcion);
        $user = Auth::user();

        // Obtiene la evaluación
        $evaluacion = EvaluacionFase::where([
            'fase_olimpiada_id' => $inscripcion->fase_id,
            'inscripcion_id'    => $inscripcion->id,
            'calificador_id'    => $user->id,
        ])->firstOrFail();

        // Solo permite editar si tienes el claim activo
        if (!$this->claimService->tieneClaimActivo($evaluacion->id, $user->id)) {
            abort(403, 'No tienes permiso para calificar esta inscripción. Reclámala primero.');
        }

        $data = $request->validate([
            'items'                    => ['required', 'array', 'min:1'],
            'items.*.item_definido_id' => ['required', 'integer', 'exists:items_definidos,id'],
            'items.*.puntaje'          => ['required', 'numeric', 'min:0'],
            'items.*.observacion'      => ['nullable', 'string', 'max:500'],
            'finalizar'                => ['nullable', 'boolean'],
        ]);

        $itemsFase = ItemDefinido::where('fase_olimpiada_id', $inscripcion->fase_id)
            ->get(['id', 'puntaje_maximo'])
            ->keyBy('id');

        $errores = [];
        foreach ($data['items'] as $idx => $row) {
            $itemId  = (int)$row['item_definido_id'];
            $puntaje = (float)$row['puntaje'];
            $it      = $itemsFase->get($itemId);
            if (!$it) {
                $errores["items.$idx.item_definido_id"] = "El ítem ($itemId) no pertenece a la fase de esta inscripción.";
                continue;
            }
            if ($puntaje > (float)$it->puntaje_maximo) {
                $errores["items.$idx.puntaje"] = "El puntaje ($puntaje) excede el máximo permitido ({$it->puntaje_maximo}).";
            }
        }
        if (!empty($errores)) {
            return back()->withErrors($errores)->withInput();
        }

        DB::transaction(function () use ($data, $evaluacion, $inscripcion, $user) {
            $total = 0.0;
            foreach ($data['items'] as $row) {
                $itemId  = (int)$row['item_definido_id'];
                $puntaje = (float)$row['puntaje'];
                $obs     = $row['observacion'] ?? null;
                ItemEvaluado::updateOrCreate(
                    [
                        'evaluacion_fase_id' => $evaluacion->id,
                        'item_definido_id'   => $itemId,
                    ],
                    [
                        'puntaje'     => $puntaje,
                        'observacion' => $obs,
                    ]
                );
                $total += $puntaje;
            }
            $nuevoEstado = ($data['finalizar'] ?? false) ? 'finalizado' : 'en_proceso';
            $evaluacion->update([
                'total'  => $total,
                'estado' => $nuevoEstado,
            ]);

            // Si finalizó, libera el claim
            if ($nuevoEstado === 'finalizado') {
                app(ClaimService::class)->release($evaluacion->id, $inscripcion->id, $user->id);
            }
        });

        return back()->with('success', 'Calificaciones guardadas correctamente.');
    }

    /* =======================
     * Helpers de área
     * ======================= */
    protected function areaIdsDelCalificador()
    {
        $user = Auth::user();
        if (method_exists($user, 'areas')) {
            return $user->areas->pluck('id');
        }
        if (isset($user->area_id)) {
            return collect([$user->area_id]);
        }
        return collect();
    }

    protected function abortIfInscripcionFueraDeMisAreas(InscripcionOlimpiada $inscripcion): void
    {
        $areaIds = $this->areaIdsDelCalificador();
        abort_if($areaIds->isEmpty(), 403, 'No tienes áreas asignadas.');

        $enMisAreas = $inscripcion->fase
            && $inscripcion->fase->olimpiada
            && in_array($inscripcion->fase->olimpiada->area_id, $areaIds->all());

        abort_unless($enMisAreas, 403, 'La inscripción no pertenece a tus áreas.');
    }
}

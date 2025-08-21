<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCalificacionOlimpiadaRequest;
use App\Models\EvaluacionFase;
use App\Models\InscripcionOlimpiada;
use App\Models\ItemDefinido;
use App\Models\ItemEvaluado;
use App\Models\Olimpiada;
use App\Models\FaseOlimpiada;
use App\Services\ClaimService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador robusto para calificar inscripciones.
 *
 * - Verifica pertenencia del calificador a las áreas de la olimpiada.
 * - Adquiere / renueva claim con TTL.
 * - Valida que los items pertenezcan a la fase e impone puntajes <= máximos.
 * - Upsert de calificaciones por ítem de manera atómica con transacción.
 * - Maneja estado de evaluación y libera claim al finalizar.
 */
class CalificacionOlimpiadaController extends Controller
{
    public function __construct(private readonly ClaimService $claimService) {}

    public function index(Request $request): \Inertia\Response
    {
        $user   = Auth::user();
        $userId = $user->id;
        $now    = now();

        $areaIds = $user->areas->pluck('id');

        if ($areaIds->isEmpty()) {
            return Inertia::render('dashboard-calificador', [
                'yaCalificadas' => [],
                'reclamadas'    => [],
                'noReclamadas'  => [],
                'stats'         => ['finalizadas' => 0, 'enProceso' => 0, 'disponibles' => 0],
                'filters'       => [
                    'selectedOlimpiadaId' => null,
                    'selectedFaseId' => null,
                    'olimpiadas' => [],
                    'fases' => [],
                ],
            ]);
        }

        $selectedOlimpiadaId = $request->integer('olimpiada_id') ?: null;
        $selectedFaseId      = $request->integer('fase_id') ?: null;

        $olimpiadas = Olimpiada::whereIn('area_id', $areaIds)->orderBy('nombre')->get(['id', 'nombre', 'area_id']);
        $fases = FaseOlimpiada::when($selectedOlimpiadaId, fn($q) => $q->where('olimpiada_id', $selectedOlimpiadaId))
            ->orderBy('nombre')->get(['id', 'nombre', 'olimpiada_id']);

        // En proceso (reclamadas)
        $reclamadas = EvaluacionFase::withResumen()
            ->delCalificador($userId)
            ->estado('en_proceso')
            ->accesiblesPorAreas($areaIds, $selectedOlimpiadaId, $selectedFaseId)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'inscripcion' => [
                    'id' => $e->inscripcion->id,
                    'fase' => ['nombre' => $e->fase->nombre ?? null],
                    'participante' => [
                        'nombre_completo' => trim(($e->inscripcion->estudiante->nombre ?? '') . ' ' . ($e->inscripcion->estudiante->apellido ?? '')),
                    ],
                ],
            ]);

        // Finalizadas
        $yaCalificadas = EvaluacionFase::withResumen()
            ->delCalificador($userId)
            ->estado('finalizado')
            ->accesiblesPorAreas($areaIds, $selectedOlimpiadaId, $selectedFaseId)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'total' => (float) $e->total,
                'inscripcion' => [
                    'id' => $e->inscripcion->id,
                    'fase' => ['nombre' => $e->fase->nombre ?? null],
                    'participante' => [
                        'nombre_completo' => trim(($e->inscripcion->estudiante->nombre ?? '') . ' ' . ($e->inscripcion->estudiante->apellido ?? '')),
                    ],
                ],
            ]);

        // Disponibles (no reclamadas)
        $noReclamadas = InscripcionOlimpiada::query()
            ->disponiblesPara($areaIds, $userId, $selectedOlimpiadaId, $selectedFaseId)
            ->with([
                'olimpiada:id,nombre,area_id',
                'estudiante:codigo,nombre,apellido',
            ])
            ->orderBy('id')
            ->limit(100)
            ->get()
            ->map(fn($i) => [
                'id' => $i->id,
                'fase' => ['nombre' => null], // la inscripción ya no tiene fase; el front puede usar filters.fases
                'participante' => [
                    'nombre_completo' => trim(($i->estudiante->nombre ?? '') . ' ' . ($i->estudiante->apellido ?? '')),
                ],
                'olimpiada' => ['nombre' => $i->olimpiada->nombre ?? null],
            ]);

        $stats = [
            'finalizadas' => $yaCalificadas->count(),
            'enProceso'   => $reclamadas->count(),
            'disponibles' => $noReclamadas->count(),
        ];

        return Inertia::render('dashboard-calificador', [
            'yaCalificadas' => $yaCalificadas,
            'reclamadas'    => $reclamadas,
            'noReclamadas'  => $noReclamadas,
            'stats'         => $stats,
            'filters'       => [
                'selectedOlimpiadaId' => $selectedOlimpiadaId,
                'selectedFaseId'      => $selectedFaseId,
                'olimpiadas'          => $olimpiadas->map(fn($o) => ['id' => $o->id, 'nombre' => $o->nombre]),
                'fases'               => $fases->map(fn($f) => ['id' => $f->id, 'nombre' => $f->nombre, 'olimpiada_id' => $f->olimpiada_id]),
            ],
        ]);
    }

    /** Muestra el formulario y adquiere/renueva el claim. */
    public function edit(int $inscripcionId): Response|RedirectResponse
    {
        $inscripcion = InscripcionOlimpiada::with([
            'fase:id,olimpiada_id',
            'fase.olimpiada:id,area_id,nombre',
            'estudiante:id,nombre,apellido,codigo'
        ])->findOrFail($inscripcionId);

        $this->ensureCalificadorPuedeVer($inscripcion->fase->olimpiada->area_id);

        // Adquiere o renueva claim (con TTL). Si está tomado por otro y aún válido -> bloquea.
        $ok = $this->claimService->acquireOrRenew($inscripcion->id, Auth::id());
        if (!$ok) {
            return redirect()->route('dashboard')
                ->with('error', 'Otro calificador está editando esta evaluación en este momento.');
        }

        // Obtener o crear evaluación de fase (idempotente)
        $evaluacion = EvaluacionFase::firstOrCreate(
            [
                'inscripcion_id' => $inscripcion->id,
                'calificador_id' => Auth::id(),
            ],
            [
                'fase_olimpiada_id' => $inscripcion->fase_id,
                'estado' => 'en_proceso',
                'total'  => 0,
            ],
        );

        // Items definidos de la fase ordenados
        $items = ItemDefinido::where('fase_olimpiada_id', $inscripcion->fase_id)
            ->orderBy('orden')
            ->get(['id', 'nombre', 'descripcion', 'puntaje_maximo', 'orden']);

        // Calificaciones previas
        $calificaciones = ItemEvaluado::where('evaluacion_fase_id', $evaluacion->id)
            ->get(['item_definido_id', 'puntaje', 'observaciones'])
            ->keyBy('item_definido_id')
            ->map(fn($row) => [
                'puntaje' => (float) $row->puntaje,
                'observacion' => (string) ($row->observaciones ?? ''),
            ]);

        return Inertia::render('calificar-inscripcion', [
            'inscripcion'    => [
                'id' => $inscripcion->id,
                'fase_id' => $inscripcion->fase_id,
                'participante' => [
                    'nombre_completo' => trim(($inscripcion->estudiante->nombre ?? '') . ' ' . ($inscripcion->estudiante->apellido ?? '')),
                ],
            ],
            'evaluacion'     => [
                'id' => $evaluacion->id,
                'estado' => $evaluacion->estado,
                'total' => (float) $evaluacion->total,
            ],
            'items'          => $items,
            'calificaciones' => $calificaciones,
        ]);
    }

    /** Guarda / finaliza la evaluación (transaccional y consistente). */
    public function update(UpdateCalificacionOlimpiadaRequest $request, int $inscripcionId): RedirectResponse
    {
        $inscripcion = InscripcionOlimpiada::with('fase.olimpiada')->findOrFail($inscripcionId);
        $this->ensureCalificadorPuedeVer($inscripcion->fase->olimpiada->area_id);

        // Debe poseer el claim vigente para poder guardar
        $this->claimService->ensureHeldByOrFail($inscripcion->id, Auth::id());

        $finalizar = (bool) $request->boolean('finalizar', false);
        $itemsInput = collect($request->validated('items'));

        // Mapa de items válidos de la fase (id -> puntaje_maximo)
        $itemsFase = ItemDefinido::where('fase_olimpiada_id', $inscripcion->fase_id)
            ->get(['id', 'puntaje_maximo'])
            ->keyBy('id');

        if ($itemsFase->isEmpty()) {
            return back()->with('error', 'La fase no tiene ítems definidos. No es posible calificar.');
        }

        // Validaciones de pertenencia y de límites de puntaje
        $errores = [];
        foreach ($itemsInput as $i => $row) {
            $id = (int) $row['item_definido_id'];
            $puntaje = (float) $row['puntaje'];

            if (!$itemsFase->has($id)) {
                $errores[] = "El ítem $id no pertenece a esta fase.";
                continue;
            }
            $max = (float) $itemsFase[$id]->puntaje_maximo;
            if ($puntaje > $max + 1e-9) {
                $errores[] = "El puntaje del ítem $id excede el máximo permitido ($max).";
            }
            if ($puntaje < 0) {
                $errores[] = "El puntaje del ítem $id no puede ser negativo.";
            }
        }

        // Si finaliza, exige que se haya calificado cada ítem definido de la fase
        if ($finalizar) {
            $idsInput = $itemsInput->pluck('item_definido_id')->map(fn($v) => (int) $v)->unique();
            $faltantes = $itemsFase->keys()->diff($idsInput);
            if ($faltantes->isNotEmpty()) {
                $errores[] = 'Faltan puntajes para los ítems: ' . $faltantes->join(', ');
            }
        }

        if (!empty($errores)) {
            return back()->with('error', implode(' ', $errores));
        }

        // Escritura atómica
        try {
            DB::transaction(function () use ($inscripcion, $itemsInput, $finalizar, &$total) {
                $total = 0.0;

                // Bloqueo de la evaluación para evitar condiciones de carrera (si la BD lo soporta)
                $evalQuery = EvaluacionFase::where('inscripcion_id', $inscripcion->id)
                    ->where('calificador_id', Auth::id());

                $isSqlite = DB::getDriverName() === 'sqlite';
                $evaluacion = $isSqlite
                    ? $evalQuery->firstOrCreate(['inscripcion_id' => $inscripcion->id, 'calificador_id' => Auth::id()], ['fase_olimpiada_id' => $inscripcion->fase_id, 'estado' => 'en_proceso', 'total' => 0])
                    : $evalQuery->lockForUpdate()->first();

                if (!$evaluacion) {
                    $evaluacion = EvaluacionFase::create([
                        'inscripcion_id'    => $inscripcion->id,
                        'calificador_id'    => Auth::id(),
                        'fase_olimpiada_id' => $inscripcion->fase_id,
                        'estado'            => 'en_proceso',
                        'total'             => 0,
                    ]);
                }

                // Preparar filas para upsert de ítems evaluados
                $now = now();
                $rows = [];
                foreach ($itemsInput as $row) {
                    $rows[] = [
                        'evaluacion_fase_id' => $evaluacion->id,
                        'item_definido_id'   => (int) $row['item_definido_id'],
                        'puntaje'            => (float) $row['puntaje'],
                        'observaciones'      => $row['observacion'] ?? null,
                        'calificado_por'     => Auth::id(),
                        'calificado_en'      => $now,
                        'created_at'         => $now,
                        'updated_at'         => $now,
                    ];
                    $total += (float) $row['puntaje'];
                }

                // Clave compuesta para upsert
                ItemEvaluado::upsert(
                    $rows,
                    ['evaluacion_fase_id', 'item_definido_id'],
                    ['puntaje', 'observaciones', 'calificado_por', 'calificado_en', 'updated_at']
                );

                // Actualizar total y estado
                $evaluacion->total = $total;
                $evaluacion->estado = $finalizar ? 'finalizado' : 'en_proceso';
                // Si tu tabla tiene finished_at o similar, aquí podrías setearlo:
                // $evaluacion->finished_at = $finalizar ? $now : null;
                $evaluacion->save();
            });
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'No se pudo guardar la calificación. Intenta de nuevo.');
        }

        // Libera el claim solo si se finaliza
        if ($finalizar) {
            $this->claimService->release($inscripcion->id, Auth::id());
        } else {
            // Opcional: renovar el TTL tras guardar parcial
            $this->claimService->heartbeat($inscripcion->id, Auth::id());
        }

        return redirect()
            ->route('dashboard')
            ->with('success', $finalizar ? 'Evaluación finalizada con éxito.' : 'Progreso guardado.');
    }

    /** Comprueba que el calificador pertenezca al área de la olimpiada. */
    private function ensureCalificadorPuedeVer(int $areaOlimpiadaId): void
    {
        // Ajusta el nombre de relación si difiere: user()->areas()->pluck('id')
        $areasUsuario = Auth::user()?->areas->pluck('id') ?? collect();
        if (!$areasUsuario->contains($areaOlimpiadaId)) {
            abort(403, 'No tienes acceso para calificar esta área.');
        }
    }

    // Reclamar una inscripción (adquiere o renueva claim y redirige al edit)
    public function claim(int $inscripcionId): RedirectResponse
    {
        $ok = $this->claimService->acquireOrRenew($inscripcionId, Auth::id());
        if (!$ok) {
            return back()->with('error', 'Otro calificador tiene un claim activo sobre esta inscripción.');
        }
        return redirect()->route('calificaciones.inscripciones.edit', $inscripcionId);
    }

    // Mantener vivo el claim (se llama desde el frontend cada 2 min)
    public function heartbeat(int $inscripcionId)
    {
        $this->claimService->heartbeat($inscripcionId, Auth::id());
        return response()->noContent(); // 204
    }

    // Liberar manualmente el claim (botón “Liberar”)
    public function release(int $inscripcionId): RedirectResponse
    {
        $this->claimService->release($inscripcionId, Auth::id());
        return back()->with('success', 'Has liberado la evaluación.');
    }
}

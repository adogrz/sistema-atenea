<?php

namespace App\Http\Controllers;

use App\Models\InternadoConducta;
use App\Models\InternadoParticipante;
use App\Models\InternadoPeriodo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class InternadoConductaController extends Controller
{
    /**
     * Mostrar control de conducta
     */
    public function conductas(Request $request): Response
    {
        $periodoActual = InternadoPeriodo::vigente()->activos()->first();
        $periodoId = $request->get('periodo_id', $periodoActual?->id);

        // Obtener todos los periodos
        $periodos = InternadoPeriodo::ordenado()
        ->get()
        ->map(function ($periodo) {
            // Calcular es_vigente manualmente
            $hoy = now()->startOfDay();
            $esVigente = $periodo->fecha_inicio && $periodo->fecha_fin 
                ? $hoy->between($periodo->fecha_inicio, $periodo->fecha_fin)
                : false;

            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_inicio' => $periodo->fecha_inicio->format('Y-m-d'),
                'fecha_fin' => $periodo->fecha_fin->format('Y-m-d'),
                'es_vigente' => $esVigente, // ← Agregar
            ];
        });

        // Obtener participantes con su conducta del periodo
        $participantes = InternadoParticipante::with(['estudiante.user', 'estudiante.centroEducativo'])
            ->where('estado', 'activo')
            ->get()
            ->map(function ($participante) use ($periodoId) {
                $estudiante = $participante->estudiante;

                $nombreCompleto = trim(
                    ($estudiante->primer_nombre ?? '') . ' ' .
                    ($estudiante->segundo_nombre ?? '') . ' ' .
                    ($estudiante->primer_apellido ?? '') . ' ' .
                    ($estudiante->segundo_apellido ?? '')
                );

                // Buscar conducta del periodo
                $conducta = InternadoConducta::where('participante_id', $participante->id)
                    ->where('periodo_id', $periodoId)
                    ->first();

                return [
                    'id' => $participante->id,
                    'codigo' => $estudiante->codigo,
                    'nombre' => $nombreCompleto ?: $estudiante->user->name ?? 'N/A',
                    'centro_educativo' => $estudiante->centroEducativo->nombre ?? 'N/A',
                    'nivel_educativo' => $estudiante->nivel_educativo ?? 'N/A',
                    'conducta' => $conducta ? [
                        'id' => $conducta->id,
                        'calificacion' => $conducta->calificacion,
                        'descripcion' => $conducta->descripcion,
                    ] : null,
                ];
            });

        return Inertia::render('fdtc/behavior/behavior-control', [
            'participantes' => $participantes,
            'periodos' => $periodos,
            'periodoSeleccionado' => $periodoId,
        ]);
    }

    /**
     * Registrar/actualizar conducta
     */
    public function store(Request $request)
    {
        $request->validate([
            'participante_id' => 'required|exists:internado_participantes,id',
            'periodo_id' => 'required|exists:internado_periodos,id',
            'calificacion' => 'required|in:excelente,buena,regular,mala',
            'descripcion' => 'nullable|string',
        ]);

        try {
            InternadoConducta::updateOrCreate(
                [
                    'participante_id' => $request->participante_id,
                    'periodo_id' => $request->periodo_id,
                ],
                [
                    'calificacion' => $request->calificacion,
                    'descripcion' => $request->descripcion,
                ]
            );

            return redirect()->back()->with('success', 'Conducta registrada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar conducta: ' . $e->getMessage());
        }
    }

    /**
     * Registrar conductas masivas
     */
    public function storeMasivo(Request $request)
    {
        $request->validate([
            'periodo_id' => 'required|exists:internado_periodos,id',
            'conductas' => 'required|array',
            'conductas.*.participante_id' => 'required|exists:internado_participantes,id',
            'conductas.*.calificacion' => 'required|in:excelente,buena,regular,mala',
            'conductas.*.descripcion' => 'nullable|string',
        ]);

        try {
            foreach ($request->conductas as $conducta) {
                InternadoConducta::updateOrCreate(
                    [
                        'participante_id' => $conducta['participante_id'],
                        'periodo_id' => $request->periodo_id,
                    ],
                    [
                        'calificacion' => $conducta['calificacion'],
                        'descripcion' => $conducta['descripcion'] ?? null,
                    ]
                );
            }

            return redirect()->back()->with('success', 'Conductas registradas exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar conductas: ' . $e->getMessage());
        }
    }

    public function reporte(Request $request)
    {
        $periodos = InternadoPeriodo::orderByDesc('fecha_inicio')
        ->get(['id','nombre','fecha_inicio','fecha_fin'])
        ->map(function ($periodo) {
            // Calcular es_vigente manualmente
            $hoy = now()->startOfDay();
            $esVigente = $periodo->fecha_inicio && $periodo->fecha_fin 
                ? $hoy->between($periodo->fecha_inicio, $periodo->fecha_fin)
                : false;

            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_inicio' => $periodo->fecha_inicio->format('Y-m-d'),
                'fecha_fin' => $periodo->fecha_fin->format('Y-m-d'),
                'es_vigente' => $esVigente, // ← Agregar
            ];
        });

        $periodoId = $request->integer('periodo_id')
            ?: (InternadoPeriodo::vigente()->value('id')
                ?? InternadoPeriodo::orderByDesc('fecha_inicio')->value('id'));

        $nivel = trim((string) $request->get('nivel', ''));

        $filas = [];

        if ($periodoId) {
            // Participantes activos con estudiante y user (mismo patrón que en CONTROL)
            $participantes = InternadoParticipante::with(['estudiante.user'])
                ->where('estado', 'activo')
                ->get();

            // Conductas del periodo, mapeadas por participante_id
            $conductas = InternadoConducta::query()
                ->where('periodo_id', $periodoId)
                ->whereIn('participante_id', $participantes->pluck('id'))
                ->get()
                ->keyBy('participante_id');

            foreach ($participantes as $p) {
                $est = $p->estudiante;
                if (!$est) continue;

                $nivelEdu = $est->nivel_educativo ?? null;
                if ($nivel !== '' && strcasecmp((string)$nivelEdu, $nivel) !== 0) {
                    continue;
                }

                $nombre = trim(
                    ($est->primer_nombre ?? '') . ' ' .
                    ($est->segundo_nombre ?? '') . ' ' .
                    ($est->primer_apellido ?? '') . ' ' .
                    ($est->segundo_apellido ?? '')
                ) ?: ($est->user->name ?? 'Sin nombre');

                $c = $conductas->get($p->id);

                $filas[] = [
                    'participante_id' => $p->id,
                    'codigo'          => (string)($est->codigo ?? ''),
                    'nombre'          => $nombre,
                    'nivel_educativo' => (string)($nivelEdu ?? ''),
                    'calificacion'    => $c->calificacion ?? null,
                    'descripcion'     => $c->descripcion ?? null,
                    'actualizado_en'  => optional(optional($c)->updated_at)->toDateString(),
                ];
            }

            usort($filas, fn($a, $b) => strcasecmp($a['nombre'] ?? '', $b['nombre'] ?? ''));
        }

        return Inertia::render('fdtc/behavior/behavior-report', [
            'periodos' => $periodos,
            'filtros'  => [
                'periodo_id' => $periodoId,
                'nivel'      => $nivel,
            ],
            'filas'   => $filas,
        ]);
    }

    public function detalle(Request $request)
    {
        $request->validate([
            'participante_id' => ['required','integer'],
            'periodo_id'      => ['required','integer'],
        ]);

        $row = InternadoConducta::query()
            ->where('participante_id', $request->integer('participante_id'))
            ->where('periodo_id', $request->integer('periodo_id'))
            ->orderByDesc('updated_at')
            ->first(['id','calificacion','descripcion','updated_at']);

        return response()->json([
            'ok'   => true,
            'data' => $row ? [
                'id'           => $row->id,
                'calificacion' => $row->calificacion,
                'descripcion'  => $row->descripcion,
                'fecha'        => optional($row->updated_at)->toDateString(),
            ] : null,
        ]);
    }
}

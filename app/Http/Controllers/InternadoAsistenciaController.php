<?php

namespace App\Http\Controllers;

use App\Models\InternadoAsistencia;
use App\Models\InternadoParticipante;
use App\Models\InternadoPeriodo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class InternadoAsistenciaController extends Controller
{
    /**
     * Mostrar control de asistencia
     */
    public function asistencias(Request $request): Response
    {
        $periodoActual = InternadoPeriodo::vigente()->activos()->first();
        $periodoId = $request->get('periodo_id', $periodoActual?->id);
        $fecha = $request->get('fecha', now()->format('Y-m-d'));

        // Obtener todos los periodos para el selector
        $periodos = InternadoPeriodo::ordenado()->get()->map(function ($periodo) {
            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_inicio' => $periodo->fecha_inicio->format('Y-m-d'),
                'fecha_fin' => $periodo->fecha_fin->format('Y-m-d'),
            ];
        });

        // Obtener participantes activos con su asistencia del día
        $participantes = InternadoParticipante::with(['estudiante.user', 'estudiante.centroEducativo', 'estudiante.nivelEducativo'])
            ->where('estado', 'activo')
            ->get()
            ->map(function ($participante) use ($fecha, $periodoId) {
                $estudiante = $participante->estudiante;
                
                $nombreCompleto = trim(
                    ($estudiante->primer_nombre ?? '') . ' ' .
                    ($estudiante->segundo_nombre ?? '') . ' ' .
                    ($estudiante->primer_apellido ?? '') . ' ' .
                    ($estudiante->segundo_apellido ?? '')
                );

                // Buscar asistencia del día
                $asistencia = InternadoAsistencia::where('participante_id', $participante->id)
                    ->where('periodo_id', $periodoId)
                    ->whereDate('fecha', $fecha)
                    ->first();

                return [
                    'id' => $participante->id,
                    'codigo' => $estudiante->codigo,
                    'nombre' => $nombreCompleto ?: $estudiante->user->name ?? 'N/A',
                    'centro_educativo' => $estudiante->centroEducativo->nombre ?? 'N/A',
                    'nivel_educativo' => $estudiante->nivel_educativo
                        ?? optional($estudiante->nivelEducativo)->nombre
                        ?? optional($estudiante->nivelEducativo)->nivel
                        ?? null,
                    'asistencia' => $asistencia ? [
                        'id' => $asistencia->id,
                        'estado' => $asistencia->estado,
                        'observaciones' => $asistencia->observaciones,
                    ] : null,
                ];
            });

        return Inertia::render('fdtc/attendance/attendance-control', [
            'participantes' => $participantes,
            'periodos' => $periodos,
            'periodoSeleccionado' => $periodoId,
            'fechaSeleccionada' => $fecha,
        ]);
    }

    /**
     * Registrar/actualizar asistencia
     */
    public function store(Request $request)
    {
        $request->validate([
            'participante_id' => 'required|exists:internado_participantes,id',
            'periodo_id' => 'required|exists:internado_periodos,id',
            'fecha' => 'required|date',
            'estado' => 'required|in:presente,ausente,justificada',
            'observaciones' => 'nullable|string',
        ]);

        try {
            InternadoAsistencia::updateOrCreate(
                [
                    'participante_id' => $request->participante_id,
                    'periodo_id' => $request->periodo_id,
                    'fecha' => $request->fecha,
                ],
                [
                    'estado' => $request->estado,
                    'observaciones' => $request->observaciones,
                ]
            );

            return redirect()->back()->with('success', 'Asistencia registrada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar asistencia: ' . $e->getMessage());
        }
    }


    /**
     * Registrar asistencia masiva
     */
    public function storeMasivo(Request $request)
    {
        $request->validate([
            'periodo_id' => 'required|exists:internado_periodos,id',
            'fecha' => 'required|date',
            'asistencias' => 'required|array',
            'asistencias.*.participante_id' => 'required|exists:internado_participantes,id',
            'asistencias.*.estado' => 'required|in:presente,ausente,justificada',
            'asistencias.*.observaciones' => 'nullable|string',
        ]);

        try {
            foreach ($request->asistencias as $asistencia) {
                InternadoAsistencia::updateOrCreate(
                    [
                        'participante_id' => $asistencia['participante_id'],
                        'periodo_id' => $request->periodo_id,
                        'fecha' => $request->fecha,
                    ],
                    [
                        'estado' => $asistencia['estado'],
                        'observaciones' => $asistencia['observaciones'] ?? null,
                    ]
                );
            }

            return redirect()->back()->with('success', 'Asistencias registradas exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al registrar asistencias: ' . $e->getMessage());
        }
    }

    /**
     * Ver reporte de asistencia por participante
     */
    public function reporte(Request $request)
    {
        $periodos = InternadoPeriodo::orderByDesc('fecha_inicio')->get(['id','nombre','fecha_inicio','fecha_fin']);

        $periodoId = $request->integer('periodo_id');
        $nivel     = trim((string) $request->get('nivel', ''));

        $filas = [];
        $resumen = ['presentes'=>0,'ausentes'=>0,'justificadas'=>0,'total'=>0];

        if ($periodoId) {
            $rows = InternadoAsistencia::query()
                ->select([
                    'participante_id',
                    DB::raw("SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as presentes"),
                    DB::raw("SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as ausentes"),
                    DB::raw("SUM(CASE WHEN estado = 'justificada' THEN 1 ELSE 0 END) as justificadas"),
                    DB::raw("COUNT(*) as total"),
                ])
                ->where('periodo_id', $periodoId)
                ->groupBy('participante_id')
                ->get();

            $participantes = InternadoParticipante::query()
                ->with(['estudiante:id,codigo,nivel_educativo,user_id','estudiante.user:id,name'])
                ->whereIn('id', $rows->pluck('participante_id')->all())
                ->get()
                ->keyBy('id');

            foreach ($rows as $r) {
                $p = $participantes->get($r->participante_id);
                if (!$p) continue;

                $est = $p->estudiante;
                $nivelEdu = $est->nivel_educativo;

                if ($nivel && strcasecmp($nivelEdu ?? '', $nivel) !== 0) continue;

                $nombre = trim($p->nombre ?? $est->user->name ?? '');
                $codigo = $est->codigo ?? '';

                $filas[] = [
                    'participante_id' => $p->id,
                    'codigo'          => $codigo,
                    'nombre'          => $nombre ?: 'Sin nombre',
                    'nivel_educativo' => $nivelEdu,
                    'presentes'       => (int) $r->presentes,
                    'ausentes'        => (int) $r->ausentes,
                    'justificadas'    => (int) $r->justificadas,
                    'total'           => (int) $r->total,
                    'porcentaje'      => (int) $r->total > 0 ? round(($r->presentes / $r->total) * 100, 1) : 0,
                ];

                $resumen['presentes']    += (int) $r->presentes;
                $resumen['ausentes']     += (int) $r->ausentes;
                $resumen['justificadas'] += (int) $r->justificadas;
                $resumen['total']        += (int) $r->total;
            }

            usort($filas, fn($a, $b) => strcasecmp($a['nombre'], $b['nombre']));
        }

        return Inertia::render('fdtc/attendance/attendance-report', [
            'periodos' => $periodos,
            'filtros'  => [
                'periodo_id' => $periodoId,
                'nivel'      => $nivel,
            ],
            'resumen' => $resumen,
            'filas'   => $filas,
        ]);
    }

    public function detalle(Request $request)
    {
        $request->validate([
            'participante_id' => ['required','integer'],
            'periodo_id'      => ['required','integer'],
        ]);

        $rows = InternadoAsistencia::query()
            ->where('participante_id', $request->integer('participante_id'))
            ->where('periodo_id', $request->integer('periodo_id'))
            ->orderBy('fecha')
            ->get(['id','fecha','estado','observaciones']);

        return response()->json(['ok' => true, 'data' => $rows]);
    }

}
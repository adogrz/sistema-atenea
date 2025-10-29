<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\InternadoParticipante;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InternadoParticipanteController extends Controller
{
    /**
     * Muestra la lista de participantes del internado
     */
    public function participants_list(): Response
    {
        $participantes = InternadoParticipante::with([
            'estudiante.user.sede',
            'estudiante.centroEducativo',
            'estudiante.nivelEducativo'
        ])
        ->whereNull('deleted_at')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($participante) {
            $estudiante = $participante->estudiante;
            
            $nombreCompleto = trim(
                ($estudiante->primer_nombre ?? '') . ' ' .
                ($estudiante->segundo_nombre ?? '') . ' ' .
                ($estudiante->primer_apellido ?? '') . ' ' .
                ($estudiante->segundo_apellido ?? '')
            );

            return [
                'id' => $participante->id,
                'codigo' => $estudiante->codigo,
                'nombre' => $nombreCompleto ?: $estudiante->user->name ?? 'N/A',
                'email' => $estudiante->email ?? $estudiante->user->email ?? 'N/A',
                'telefono' => $estudiante->telefono_estudiante ?? 'N/A',
                'centro_educativo' => $estudiante->centroEducativo->nombre ?? 'N/A',
                'nivel_educativo' => $estudiante->nivelEducativo->nivel ?? 'N/A',
                'sede_description' => $estudiante->user->sede->description ?? 'Sin sede',
                'estado' => $participante->estado,
                'usuario_activo' => $estudiante->user->status === 'active',
                'fecha_ingreso' => $participante->created_at->format('d/m/Y'),
            ];
        });

        return Inertia::render('fdtc/participants/participant-management', [
            'participantes' => $participantes,
        ]);
    }

    /**
     * Cambiar el estado de un participante
     */
    public function cambiarEstado(Request $request)
    {
        $request->validate([
            'participantes_ids' => 'required|array',
            'participantes_ids.*' => 'integer|exists:internado_participantes,id',
            'nuevo_estado' => 'required|in:activo,inactivo,completado,suspendido',
        ]);

        try {
            $actualizados = InternadoParticipante::whereIn('id', $request->participantes_ids)
                ->update(['estado' => $request->nuevo_estado]);

            return redirect()->back()->with('success', "$actualizados participante(s) actualizado(s) a estado: {$request->nuevo_estado}");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al cambiar estado: ' . $e->getMessage());
        }
    }

    /**
     * Remover participantes del internado (soft delete)
     */
    public function remover(Request $request)
    {
        $request->validate([
            'participantes_ids' => 'required|array',
            'participantes_ids.*' => 'integer|exists:internado_participantes,id',
        ]);

        try {
            $removidos = InternadoParticipante::whereIn('id', $request->participantes_ids)
                ->delete(); // Soft delete

            return redirect()->back()->with('success', "$removidos participante(s) removido(s) del internado");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al remover participantes: ' . $e->getMessage());
        }
    }

    /**
     * Muestra el progreso individual de un participante
     */
    public function progreso(InternadoParticipante $participante): Response
    {
        // Resumen por materia
        $resumen = DB::table('internado_calificaciones as c')
            ->join('internado_evaluaciones as e', 'e.id', '=', 'c.evaluacion_id')
            ->join('materias as m', 'm.id', '=', 'e.materia_id')
            ->where('c.participante_id', $participante->id)
            ->groupBy('e.materia_id', 'm.nombre', 'm.codigo')
            ->selectRaw('e.materia_id, m.nombre as materia, m.codigo, COUNT(e.id) as evaluaciones_count, COALESCE(SUM(e.peso_porcentual),0) as peso_total, COALESCE(AVG(c.nota),0) as promedio')
            ->get();

        // Detalle por materia
        $detalle = DB::table('internado_calificaciones as c')
            ->join('internado_evaluaciones as e', 'e.id', '=', 'c.evaluacion_id')
            ->where('c.participante_id', $participante->id)
            ->orderBy('e.materia_id')
            ->orderBy('e.fecha_inicio')
            ->select([
                'e.materia_id',
                'e.id as evaluacion_id',
                'e.nombre',
                'e.fecha_inicio', // <- sin DATE_FORMAT
                'e.peso_porcentual',
                'e.nota_maxima',
                'c.nota',
            ])
            ->get()
            ->groupBy('materia_id');

        $materias_stats = $resumen->map(function ($r) use ($detalle) {
            return [
                'materia_id' => (int) $r->materia_id,
                'materia' => $r->materia,
                'codigo' => $r->codigo,
                'evaluaciones_count' => (int) $r->evaluaciones_count,
                'peso_total' => (float) $r->peso_total,
                'promedio' => (float) $r->promedio,
                'detalle' => ($detalle[$r->materia_id] ?? collect())->map(function ($d) {
                    return [
                        'evaluacion_id' => (int) $d->evaluacion_id,
                        'nombre' => $d->nombre,
                        'fecha' => $d->fecha_inicio ? Carbon::parse($d->fecha_inicio)->format('Y-m-d') : null,
                        'peso_porcentual' => (float) $d->peso_porcentual,
                        'nota_maxima' => (float) $d->nota_maxima,
                        'nota' => $d->nota !== null ? (float) $d->nota : null,
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('fdtc/components/student-progress', [
            'participante' => [
                'id' => $participante->id,
                'codigo' => $participante->estudiante->codigo ?? '',
                'nombre' => $participante->estudiante->user->name ?? '',
                'email' => $participante->estudiante->email ?? ($participante->estudiante->user->email ?? ''),
                'telefono' => $participante->estudiante->telefono ?? '',
                'centro_educativo' => $participante->estudiante->centroEducativo->nombre ?? '',
                'nivel_educativo' => $participante->estudiante->nivel_educativo ?? '',
                'sede_name' => $participante->sede->nombre ?? '',
                'sede_description' => $participante->sede->descripcion ?? null,
                'estado' => $participante->estado,
                'fecha_ingreso' => optional($participante->fecha_ingreso)->format('Y-m-d'),
                'dias_en_internado' => optional($participante->fecha_ingreso)->diffInDays(now()) ?? 0,
            ],
            'materias_stats' => $materias_stats,
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\InternadoParticipante;

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
    public function showProgreso(string $codigo): Response
    {
        $participante = InternadoParticipante::with([
            'estudiante.user.sede',
            'estudiante.centroEducativo',
            'estudiante.nivelEducativo'
        ])
        ->whereHas('estudiante', function ($query) use ($codigo) {
            $query->where('codigo', $codigo);
        })
        ->firstOrFail();

        $estudiante = $participante->estudiante;
        
        $nombreCompleto = trim(
            ($estudiante->primer_nombre ?? '') . ' ' .
            ($estudiante->segundo_nombre ?? '') . ' ' .
            ($estudiante->primer_apellido ?? '') . ' ' .
            ($estudiante->segundo_apellido ?? '')
        );

        $data = [
            'participante' => [
                'id' => $participante->id,
                'codigo' => $estudiante->codigo,
                'nombre' => $nombreCompleto ?: $estudiante->user->name ?? 'N/A',
                'email' => $estudiante->email ?? $estudiante->user->email ?? 'N/A',
                'telefono' => $estudiante->telefono_estudiante ?? 'N/A',
                'centro_educativo' => $estudiante->centroEducativo->nombre ?? 'N/A',
                'nivel_educativo' => $estudiante->nivelEducativo->nivel ?? 'N/A',
                'sede_description' => $estudiante->user->sede->description ?? 'Sin sede',
                'estado' => $participante->estado,
                'fecha_ingreso' => $participante->created_at->format('d/m/Y'),
            ],
            // TODO: Agregar aquí las métricas de progreso, evaluaciones, etc.
        ];

        return Inertia::render('fdtc/components/student-progress', $data);
    }
}
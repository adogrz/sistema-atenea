<?php

namespace App\Http\Controllers;

use App\Models\InternadoEvaluacion;
use App\Models\InternadoParticipante;
use App\Models\InternadoCalificacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InternadoEvaluacionController extends Controller
{
    /**
     * Mostrar lista de evaluaciones
     */
    public function index(): Response
    {
        $evaluaciones = InternadoEvaluacion::withCount([
            'calificaciones',
            'calificaciones as calificaciones_completadas' => function ($query) {
                $query->whereNotNull('nota');
            }
        ])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($evaluacion) {
            return [
                'id' => $evaluacion->id,
                'nombre' => $evaluacion->nombre,
                'descripcion' => $evaluacion->descripcion,
                'peso_porcentual' => $evaluacion->peso_porcentual,
                'nota_maxima' => $evaluacion->nota_maxima,
                'total_estudiantes' => $evaluacion->calificaciones_count,
                'estudiantes_calificados' => $evaluacion->calificaciones_completadas,
                'promedio' => $evaluacion->promedio,
                'created_at' => $evaluacion->created_at->format('d/m/Y'),
            ];
        });

        return Inertia::render('fdtc/evaluations/evaluations-list', [
            'evaluaciones' => $evaluaciones,
        ]);
    }

    /**
     * Crear nueva evaluación
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'peso_porcentual' => 'required|numeric|min:0|max:100',
            'nota_maxima' => 'required|numeric|min:0|max:10',
        ]);

        try {
            $evaluacion = InternadoEvaluacion::create($request->only([
                'nombre',
                'descripcion',
                'peso_porcentual',
                'nota_maxima',
            ]));

            // Crear registros de calificación para todos los participantes activos
            $participantes = InternadoParticipante::whereNull('deleted_at')->get();
            
            foreach ($participantes as $participante) {
                InternadoCalificacion::create([
                    'evaluacion_id' => $evaluacion->id,
                    'participante_id' => $participante->id,
                ]);
            }

            return redirect()->back()->with('success', 'Evaluación creada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al crear evaluación: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar evaluación
     */
    public function update(Request $request, InternadoEvaluacion $evaluacion)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'peso_porcentual' => 'required|numeric|min:0|max:100',
            'nota_maxima' => 'required|numeric|min:0|max:10',
        ]);

        try {
            $evaluacion->update($request->only([
                'nombre',
                'descripcion',
                'peso_porcentual',
                'nota_maxima',
            ]));

            return redirect()->back()->with('success', 'Evaluación actualizada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar evaluación: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar evaluación
     */
    public function destroy(InternadoEvaluacion $evaluacion)
    {
        try {
            $evaluacion->delete();
            return redirect()->back()->with('success', 'Evaluación eliminada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar evaluación: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar detalles de una evaluación con todas las calificaciones
     */
    public function show(InternadoEvaluacion $evaluacion): Response
    {
        $calificaciones = InternadoCalificacion::where('evaluacion_id', $evaluacion->id)
            ->with([
                'participante.estudiante.user',
                'participante.estudiante.centroEducativo',
            ])
            ->get()
            ->map(function ($calificacion) {
                $estudiante = $calificacion->participante->estudiante;
                
                $nombreCompleto = trim(
                    ($estudiante->primer_nombre ?? '') . ' ' .
                    ($estudiante->segundo_nombre ?? '') . ' ' .
                    ($estudiante->primer_apellido ?? '') . ' ' .
                    ($estudiante->segundo_apellido ?? '')
                );

                return [
                    'id' => $calificacion->id,
                    'participante_id' => $calificacion->participante_id,
                    'codigo' => $estudiante->codigo,
                    'nombre' => $nombreCompleto ?: $estudiante->user->name ?? 'N/A',
                    'email' => $estudiante->email ?? $estudiante->user->email ?? 'N/A',
                    'centro_educativo' => $estudiante->centroEducativo->nombre ?? 'N/A',
                    'nota' => $calificacion->nota,
                    'observaciones' => $calificacion->observaciones,
                ];
            });

        return Inertia::render('fdtc/evaluations/evaluation-details', [
            'evaluacion' => [
                'id' => $evaluacion->id,
                'nombre' => $evaluacion->nombre,
                'descripcion' => $evaluacion->descripcion,
                'peso_porcentual' => $evaluacion->peso_porcentual,
                'nota_maxima' => $evaluacion->nota_maxima,
                'promedio' => $evaluacion->promedio,
            ],
            'calificaciones' => $calificaciones,
        ]);
    }

    /**
     * Guardar/actualizar calificación
     */
    public function guardarCalificacion(Request $request, InternadoCalificacion $calificacion)
    {
        $request->validate([
            'nota' => 'required|numeric|min:0|max:' . $calificacion->evaluacion->nota_maxima,
            'observaciones' => 'nullable|string',
        ]);

        try {
            $calificacion->update([
                'nota' => $request->nota,
                'observaciones' => $request->observaciones,
            ]);

            return redirect()->back()->with('success', 'Calificación guardada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al guardar calificación: ' . $e->getMessage());
        }
    }

    /**
     * Guardar múltiples calificaciones
     */
    public function guardarCalificacionesMasivo(Request $request, InternadoEvaluacion $evaluacion)
    {
        $request->validate([
            'calificaciones' => 'required|array',
            'calificaciones.*.id' => 'required|exists:internado_calificaciones,id',
            'calificaciones.*.nota' => 'required|numeric|min:0|max:' . $evaluacion->nota_maxima,
            'calificaciones.*.observaciones' => 'nullable|string',
        ]);

        try {
            foreach ($request->calificaciones as $calificacionData) {
                InternadoCalificacion::where('id', $calificacionData['id'])
                    ->update([
                        'nota' => $calificacionData['nota'],
                        'observaciones' => $calificacionData['observaciones'] ?? null,
                    ]);
            }

            return redirect()->back()->with('success', 'Calificaciones guardadas exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al guardar calificaciones: ' . $e->getMessage());
        }
    }
}
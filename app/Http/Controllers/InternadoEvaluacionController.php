<?php

namespace App\Http\Controllers;

use App\Models\InternadoCalificacion;
use App\Models\InternadoEvaluacion;
use App\Models\InternadoMateria;
use App\Models\InternadoParticipante;
use App\Models\InternadoPeriodo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InternadoEvaluacionController extends Controller
{
    public function evaluaciones(Request $request): Response
    {
        $periodoId = $request->integer('periodo_id');
        $materiaId = $request->integer('materia_id');

        $query = InternadoEvaluacion::query()
            ->with(['periodo:id,nombre', 'materia:id,nombre,codigo'])
            ->withCount([
                'calificaciones as total_estudiantes',
                'calificaciones as estudiantes_calificados' => fn($q) => $q->whereNotNull('nota'),
            ])
            ->withAvg(['calificaciones as promedio' => fn($q) => $q->whereNotNull('nota')], 'nota');

        if ($periodoId) {
            $query->where('periodo_id', $periodoId);
        }
        if ($materiaId) {
            $query->where('materia_id', $materiaId);
        }

        $evaluaciones = $query->orderByDesc('created_at')
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'periodo' => $e->periodo?->nombre,
                'materia_id' => $e->materia_id,
                'materia' => $e->materia?->nombre,
                'materia_codigo' => $e->materia?->codigo,
                'nombre' => $e->nombre,
                'descripcion' => $e->descripcion,
                'peso_porcentual' => (float) $e->peso_porcentual,
                'nota_maxima' => (float) $e->nota_maxima,
                'fecha_inicio' => $e->fecha_inicio?->format('Y-m-d'),
                'fecha_fin' => $e->fecha_fin?->format('Y-m-d'),
                'permite_credito_extra' => (bool) $e->permite_credito_extra,
                'credito_extra_max' => (float) $e->credito_extra_max,
                'total_estudiantes' => (int) $e->total_estudiantes,
                'estudiantes_calificados' => (int) $e->estudiantes_calificados,
                'promedio' => (float) ($e->promedio ?? 0),
                'created_at' => $e->created_at?->format('d/m/Y'),
            ]);

        $periodos = InternadoPeriodo::orderByDesc('fecha_inicio')->get(['id', 'nombre', 'es_vigente']);
        $materias = InternadoMateria::orderBy('nombre')->get(['id', 'nombre', 'codigo']);

        return Inertia::render('fdtc/evaluations/evaluations-management', [
            'evaluaciones' => $evaluaciones,
            'periodos' => $periodos,
            'materias' => $materias,
            'filtros' => [
                'periodo_id' => $periodoId,
                'materia_id' => $materiaId,
            ],
        ]);
    }

    public function create(): Response
    {
        $periodos = InternadoPeriodo::orderByDesc('fecha_inicio')->get(['id', 'nombre', 'es_vigente']);
        $materias = InternadoMateria::orderBy('nombre')->get(['id', 'nombre', 'codigo']);

        return Inertia::render('fdtc/evaluations/create-evaluation', [
            'periodos' => $periodos,
            'materias' => $materias,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'periodo_id' => 'required|exists:internado_periodos,id',
            'materia_id' => 'required|exists:materias,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'peso_porcentual' => 'required|numeric|min:0|max:100',
            'nota_maxima' => 'required|numeric|min:0|max:10',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'permite_credito_extra' => 'boolean',
            'credito_extra_max' => 'nullable|numeric|min:0|max:5',
        ]);

        DB::transaction(function () use ($validated) {
            $eva = InternadoEvaluacion::create([
                'periodo_id' => (int) $validated['periodo_id'],
                'materia_id' => (int) $validated['materia_id'],
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'peso_porcentual' => (float) $validated['peso_porcentual'],
                'nota_maxima' => (float) $validated['nota_maxima'],
                'fecha_inicio' => $validated['fecha_inicio'] ?? null,
                'fecha_fin' => $validated['fecha_fin'] ?? null,
                'permite_credito_extra' => (bool) ($validated['permite_credito_extra'] ?? false),
                'credito_extra_max' => isset($validated['credito_extra_max']) ? (float) $validated['credito_extra_max'] : 0,
            ]);

            $participantes = InternadoParticipante::where('estado', 'activo')->get(['id']);
            foreach ($participantes as $p) {
                InternadoCalificacion::create([
                    'evaluacion_id' => $eva->id,
                    'participante_id' => $p->id,
                ]);
            }
        });

        return redirect()->route('internado-fdtc.evaluaciones')->with('success', 'Evaluación creada exitosamente');
    }

    public function edit(InternadoEvaluacion $evaluacion): Response
    {
        $periodos = InternadoPeriodo::orderByDesc('fecha_inicio')->get(['id', 'nombre', 'es_vigente']);
        $materias = InternadoMateria::orderBy('nombre')->get(['id', 'nombre', 'codigo']);

        $total = $evaluacion->calificaciones()->count();
        $calificados = $evaluacion->calificaciones()->whereNotNull('nota')->count();
        $promedio = (float) ($evaluacion->calificaciones()->whereNotNull('nota')->avg('nota') ?? 0);

        return Inertia::render('fdtc/evaluations/edit-evaluation', [
            'evaluacion' => [
                'id' => $evaluacion->id,
                'periodo_id' => $evaluacion->periodo_id,
                'materia_id' => $evaluacion->materia_id,
                'nombre' => $evaluacion->nombre,
                'descripcion' => $evaluacion->descripcion,
                'peso_porcentual' => $evaluacion->peso_porcentual,
                'nota_maxima' => $evaluacion->nota_maxima,
                'fecha_inicio' => $evaluacion->fecha_inicio?->format('Y-m-d'),
                'fecha_fin' => $evaluacion->fecha_fin?->format('Y-m-d'),
                'permite_credito_extra' => (bool) $evaluacion->permite_credito_extra,
                'credito_extra_max' => $evaluacion->credito_extra_max,
                'total_estudiantes' => $total,
                'estudiantes_calificados' => $calificados,
                'promedio' => $promedio,
            ],
            'periodos' => $periodos,
            'materias' => $materias,
        ]);
    }

    public function update(Request $request, InternadoEvaluacion $evaluacion)
    {
        $validated = $request->validate([
            'periodo_id' => 'required|exists:internado_periodos,id',
            'materia_id' => 'required|exists:materias,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'peso_porcentual' => 'required|numeric|min:0|max:100',
            'nota_maxima' => 'required|numeric|min:0|max:10',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'permite_credito_extra' => 'boolean',
            'credito_extra_max' => 'nullable|numeric|min:0|max:5',
        ]);

        $evaluacion->update([
            'periodo_id' => (int) $validated['periodo_id'],
            'materia_id' => (int) $validated['materia_id'],
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'peso_porcentual' => (float) $validated['peso_porcentual'],
            'nota_maxima' => (float) $validated['nota_maxima'],
            'fecha_inicio' => $validated['fecha_inicio'] ?? null,
            'fecha_fin' => $validated['fecha_fin'] ?? null,
            'permite_credito_extra' => (bool) ($validated['permite_credito_extra'] ?? false),
            'credito_extra_max' => isset($validated['credito_extra_max']) ? (float) $validated['credito_extra_max'] : 0,
        ]);

        return redirect()->route('internado-fdtc.evaluaciones')->with('success', 'Evaluación actualizada exitosamente');
    }

    public function destroy(InternadoEvaluacion $evaluacion)
    {
        $evaluacion->delete();
        return redirect()->route('internado-fdtc.evaluaciones')->with('success', 'Evaluación eliminada exitosamente');
    }

    public function show(InternadoEvaluacion $evaluacion): Response
    {
        // Asegurar calificaciones para todos los participantes activos
        $activos = InternadoParticipante::where('estado', 'activo')->pluck('id');
        $existentes = InternadoCalificacion::where('evaluacion_id', $evaluacion->id)->pluck('participante_id');
        $faltantes = $activos->diff($existentes);

        foreach ($faltantes as $pid) {
            InternadoCalificacion::create([
                'evaluacion_id' => $evaluacion->id,
                'participante_id' => $pid,
            ]);
        }

        $calificaciones = InternadoCalificacion::where('evaluacion_id', $evaluacion->id)
            ->with(['participante.estudiante.user', 'participante.estudiante.centroEducativo'])
            ->get()
            ->map(function ($calificacion) {
                $est = $calificacion->participante->estudiante;

                $nombreCompleto = trim(
                    ($est->primer_nombre ?? '') . ' ' .
                    ($est->segundo_nombre ?? '') . ' ' .
                    ($est->primer_apellido ?? '') . ' ' .
                    ($est->segundo_apellido ?? '')
                );

                return [
                    'id' => $calificacion->id,
                    'participante_id' => $calificacion->participante_id,
                    'codigo' => $est->codigo,
                    'nombre' => $nombreCompleto ?: ($est->user->name ?? 'N/A'),
                    'email' => $est->email ?? ($est->user->email ?? 'N/A'),
                    'centro_educativo' => $est->centroEducativo->nombre ?? 'N/A',
                    'nota' => $calificacion->nota,
                    'observaciones' => $calificacion->observaciones,
                ];
            });

        $promedio = (float) ($evaluacion->calificaciones()->whereNotNull('nota')->avg('nota') ?? 0);

        return Inertia::render('fdtc/calification/calification-show', [
            'evaluacion' => [
                'id' => $evaluacion->id,
                'nombre' => $evaluacion->nombre,
                'descripcion' => $evaluacion->descripcion,
                'peso_porcentual' => $evaluacion->peso_porcentual,
                'nota_maxima' => $evaluacion->nota_maxima,
                'promedio' => $promedio,
            ],
            'calificaciones' => $calificaciones,
        ]);
    }

    public function guardarCalificacion(Request $request, InternadoCalificacion $calificacion)
    {
        $request->validate([
            'nota' => 'required|numeric|min:0|max:' . $calificacion->evaluacion->nota_maxima,
            'observaciones' => 'nullable|string',
        ]);

        $calificacion->update([
            'nota' => $request->nota,
            'observaciones' => $request->observaciones,
        ]);

        return redirect()->back()->with('success', 'Calificación guardada exitosamente');
    }

    public function guardarCalificacionesMasivo(Request $request, InternadoEvaluacion $evaluacion)
    {
        $request->validate([
            'calificaciones' => 'required|array',
            'calificaciones.*.id' => 'required|exists:internado_calificaciones,id',
            'calificaciones.*.nota' => 'required|numeric|min:0|max:' . $evaluacion->nota_maxima,
            'calificaciones.*.observaciones' => 'nullable|string',
        ]);

        foreach ($request->calificaciones as $c) {
            InternadoCalificacion::where('id', $c['id'])->update([
                'nota' => $c['nota'],
                'observaciones' => $c['observaciones'] ?? null,
            ]);
        }

        return redirect()->back()->with('success', 'Calificaciones guardadas exitosamente');
    }
}
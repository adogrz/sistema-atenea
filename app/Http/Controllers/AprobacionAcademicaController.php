<?php

namespace App\Http\Controllers;

use App\Models\OlimpiadaAprobacionFinal;
use App\Models\Estudiante;
use App\Models\Grupo;
use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AprobacionAcademicaController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $query = OlimpiadaAprobacionFinal::with(['estudiante.user', 'olimpiada', 'fase', 'grupo']);

        // Filtering by area for Coordinador de Area
        if ($user->hasRole('coordinador-area')) {
            $primaryArea = $user->primaryArea();
            if ($primaryArea) {
                $query->whereHas('olimpiada', function ($q) use ($primaryArea) {
                    $q->where('area_id', $primaryArea->id);
                });
            }
        }

        // Filters from request
        if ($request->has('area_id')) {
            $query->whereHas('olimpiada', function ($q) use ($request) {
                $q->where('area_id', $request->input('area_id'));
            });
        }

        if ($request->has('prueba_psicologica_aprobada')) {
            $query->whereHas('estudiante', function ($q) use ($request) {
                $q->where('prueba_psicologica_aprobada', $request->boolean('prueba_psicologica_aprobada'));
            });
        }

        $aprobaciones = $query->latest()->get();
        $areas = Area::all();
        $grupos = Grupo::all();

        return Inertia::render('AprobacionAcademica/Index', [
            'aprobaciones' => $aprobaciones,
            'areas' => $areas,
            'grupos' => $grupos,
        ]);
    }

    public function store(Request $request)
    {
        // This method will be used by Coordinador Académico to send approved students
        $request->validate([
            'estudiante_codigo' => ['required', 'string', 'exists:estudiantes,codigo'],
            'olimpiada_id' => ['required', 'integer', 'exists:olimpiadas,id'],
            'fase_id' => ['required', 'integer', 'exists:fases_olimpiadas,id'],
        ]);

        // Prevent duplicate entries for the same student in the same phase
        $existing = OlimpiadaAprobacionFinal::where('estudiante_codigo', $request->input('estudiante_codigo'))
            ->where('fase_id', $request->input('fase_id'))
            ->first();

        if ($existing) {
            return response()->json(['message' => 'El estudiante ya ha sido enviado para aprobación en esta fase.'], 409);
        }

        OlimpiadaAprobacionFinal::create([
            'estudiante_codigo' => $request->input('estudiante_codigo'),
            'olimpiada_id' => $request->input('olimpiada_id'),
            'fase_id' => $request->input('fase_id'),
            'fecha_aprobacion' => now(),
            'estado_aceptacion' => 'pendiente',
        ]);

        return response()->json(['message' => 'Estudiante enviado para aprobación exitosamente.'], 201);
    }

    public function update(Request $request, OlimpiadaAprobacionFinal $aprobacionFinal)
    {
        $request->validate([
            'grupo_id' => ['nullable', 'integer', 'exists:grupos,id'],
            'estado_aceptacion' => ['required', 'in:pendiente,aceptado,rechazado'],
        ]);

        // Authorization check
        $user = Auth::user();
        if ($user->hasRole('coordinador-area')) {
            $primaryArea = $user->primaryArea();
            if (!$primaryArea || $aprobacionFinal->olimpiada->area_id !== $primaryArea->id) {
                return response()->json(['message' => 'No tienes permiso para modificar esta aprobación.'], 403);
            }
        } elseif (!$user->hasRole('admin-academico')) {
            return response()->json(['message' => 'Permiso denegado.'], 403);
        }

        $aprobacionFinal->load('olimpiada');

        $dataToUpdate = $request->only('estado_aceptacion');

        if ($aprobacionFinal->olimpiada->tipo === 'olimpico') {
            if ($request->has('grupo_id')) {
                $dataToUpdate['grupo_id'] = $request->input('grupo_id');
            }
        } else {
            // If it's not an 'olimpico' type, ensure grupo_id is not set or is nullified
            $dataToUpdate['grupo_id'] = null;
        }

        $aprobacionFinal->update($dataToUpdate);

        return response()->json(['message' => 'Aprobación actualizada exitosamente.']);
    }

    public function generateCodes(Request $request)
    {
        $request->validate([
            'aprobacion_ids' => ['required', 'array'],
            'aprobacion_ids.*' => ['integer', 'exists:olimpiada_aprobaciones_finales,id'],
        ]);

        $aprobaciones = OlimpiadaAprobacionFinal::whereIn('id', $request->input('aprobacion_ids'))
            ->with('estudiante')
            ->get();

        $count = 0;
        DB::transaction(function () use ($aprobaciones, &$count) {
            foreach ($aprobaciones as $aprobacion) {
                if ($aprobacion->estudiante && !$aprobacion->estudiante->codigo_permanente) {
                    $aprobacion->estudiante->generateAndAssignPermanentCode();
                    $count++;
                }
            }
        });

        return response()->json(['message' => "$count códigos permanentes generados y asignados exitosamente."]);
    }

    public function getEmails(Request $request)
    {
        $request->validate([
            'aprobacion_ids' => ['required', 'array'],
            'aprobacion_ids.*' => ['integer', 'exists:olimpiada_aprobaciones_finales,id'],
        ]);

        $aprobaciones = OlimpiadaAprobacionFinal::whereIn('id', $request->input('aprobacion_ids'))
            ->with('estudiante.user')
            ->get();

        $emails = $aprobaciones->pluck('estudiante.user.email')
            ->filter()
            ->unique()
            ->values()
            ->all();

        return response()->json(['emails' => $emails]);
    }

    // The show and destroy methods are not directly needed for this workflow but are part of resource controller
    public function show(string $id)
    {
        // Not implemented for this workflow
        return response()->json(['message' => 'Not implemented'], 501);
    }

    public function destroy(string $id)
    {
        // Not implemented for this workflow
        return response()->json(['message' => 'Not implemented'], 501);
    }
}

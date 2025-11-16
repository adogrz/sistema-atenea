<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluacionController extends Controller
{
    public function show(Evaluacion $evaluacion)
    {
        $evaluacion->load(['inscripcion.estudiante.user', 'faseOlimpiada.olimpiada', 'itemsEvaluados.itemDefinido', 'itemsEvaluados.calificador']);

        // Para peticiones AJAX, retornar JSON
        if (request()->expectsJson()) {
            return response()->json([
                'evaluacion' => $evaluacion,
            ]);
        }

        // Para peticiones normales, retornar vista Inertia
        return Inertia::render('Evaluaciones/Show', [
            'evaluacion' => $evaluacion,
        ]);
    }
}
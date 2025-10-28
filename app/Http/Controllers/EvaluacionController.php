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

        return Inertia::render('Evaluaciones/Show', [
            'evaluacion' => $evaluacion,
        ]);
    }
}
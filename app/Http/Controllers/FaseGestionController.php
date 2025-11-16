<?php

namespace App\Http\Controllers;

use App\Models\FaseOlimpiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class FaseGestionController extends Controller
{
    public function update(Request $request, FaseOlimpiada $fase)
    {
        Gate::authorize('manage', $fase);

        $validated = $request->validate([
            'cupos' => ['nullable', 'integer', 'min:0'],
            'nota_minima_aprobacion' => ['nullable', 'numeric', 'min:0'],
            'fecha_inicio_inscripcion' => ['nullable', 'date'],
            'fecha_fin_inscripcion' => ['nullable', 'date', 'after_or_equal:fecha_inicio_inscripcion'],
        ]);

        $fase->update($validated);

        return redirect()->back()->with('success', 'Fase actualizada exitosamente.');
    }

    public function publishResults(FaseOlimpiada $fase)
    {
        Gate::authorize('manage', $fase);

        $fase->update(['resultados_publicados' => true]);

        // Opcional: Disparar un evento/notificación para informar a los estudiantes
        // event(new ResultadosPublicados($fase));

        return redirect()->back()->with('success', '¡Resultados publicados exitosamente!');
    }
}

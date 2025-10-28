<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Olimpiada;
use App\Models\DefinicionEvaluacion;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\NivelEducativo;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadaController extends Controller
{
    public function index(Request $request): Response
    {
        $olimpiadas = Olimpiada::with('area', 'nivelEducativo', 'fases')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Olimpiadas/index', [
            'olimpiadas' => $olimpiadas,
            'areas' => Area::all(),
            'nivelesEducativos' => NivelEducativo::all(),
            'definiciones_evaluacion' => DefinicionEvaluacion::all(),
        ]);
    }



    public function create()
    {
        return Inertia::render('Olimpiadas/OlimpiadaForm', [
            'areas' => Area::all(),
            'nivelesEducativos' => NivelEducativo::all(),
        ]);
    }

    public function edit(Olimpiada $olimpiada)
    {
        $olimpiada->load('fases');
        return Inertia::render('Olimpiadas/OlimpiadaForm', [
            'olimpiada' => $olimpiada,
            'areas' => Area::all(),
            'nivelesEducativos' => NivelEducativo::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'area_id' => ['required', 'integer', 'exists:areas,id'],
            'activa' => ['required', 'boolean'],
            'nivel_educativo_id' => ['nullable', 'integer', 'exists:niveles_educativos,codigo'],
            'fases' => ['nullable', 'array'],
            'fases.*.nombre' => ['required', 'string', 'max:255'],
            'fases.*.orden' => ['required', 'integer', 'min:1'],
            'fases.*.fecha_inicio' => ['required', 'date'],
            'fases.*.fecha_fin' => ['required', 'date', 'after_or_equal:fases.*.fecha_inicio'],
            'fases.*.activa' => ['required', 'boolean'],
            'fases.*.observaciones' => ['nullable', 'string'],
        ]);

        $olimpiada = Olimpiada::create($validated);
        activity()->performedOn($olimpiada)->log('Olimpiada creada');

        if (isset($validated['fases'])) {
            foreach ($validated['fases'] as $faseData) {
                $olimpiada->fases()->create($faseData);
            }
        }

        return redirect()->route('olimpiadas.index')->with('success', 'Olimpiada creada exitosamente.');
    }

    public function update(Request $request, Olimpiada $olimpiada)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'area_id' => ['required', 'integer', 'exists:areas,id'],
            'activa' => ['required', 'boolean'],
            'nivel_educativo_id' => ['nullable', 'integer', 'exists:niveles_educativos,codigo'],
            'fases' => ['nullable', 'array'],
            'fases.*.id' => ['nullable', 'integer', 'exists:fases_olimpiadas,id'], // Existing phases will have an ID
            'fases.*.nombre' => ['required', 'string', 'max:255'],
            'fases.*.orden' => ['required', 'integer', 'min:1'],
            'fases.*.fecha_inicio' => ['required', 'date'],
            'fases.*.fecha_fin' => ['required', 'date', 'after_or_equal:fases.*.fecha_inicio'],
            'fases.*.activa' => ['required', 'boolean'],
            'fases.*.observaciones' => ['nullable', 'string'],
        ]);

        $olimpiada->update($validated);
        activity()->performedOn($olimpiada)->log('Olimpiada actualizada');

        if (isset($validated['fases'])) {
            $incomingPhaseIds = collect($validated['fases'])->pluck('id')->filter()->all();
            $existingPhaseIds = $olimpiada->fases->pluck('id')->all();

            // Delete phases that are no longer present in the incoming data
            $phasesToDelete = array_diff($existingPhaseIds, $incomingPhaseIds);
            FaseOlimpiada::destroy($phasesToDelete);

            foreach ($validated['fases'] as $faseData) {
                if (isset($faseData['id'])) {
                    // Update existing phase
                    $fase = $olimpiada->fases()->where('id', $faseData['id'])->first();
                    if ($fase) {
                        $fase->update($faseData);
                    }
                } else {
                    // Create new phase
                    $olimpiada->fases()->create($faseData);
                }
            }
        }

        return redirect()->back()->with('success', 'Olimpiada actualizada exitosamente.');
    }

    public function destroy(Olimpiada $olimpiada)
    {
        try {
            activity()->performedOn($olimpiada)->log('Olimpiada eliminada');
            $olimpiada->delete();
            return redirect()->back()->with('success', 'Olimpiada eliminada exitosamente.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'No se puede eliminar la olimpiada porque tiene fases u otros registros asociados.');
        }
    }
}

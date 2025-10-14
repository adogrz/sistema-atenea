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
        $olimpiadas = Olimpiada::with('area', 'nivelEducativo')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('olympics/index', [
            'olimpiadas' => $olimpiadas,
            'areas' => Area::all(),
            'nivelesEducativos' => NivelEducativo::all(),
            'definiciones_evaluacion' => DefinicionEvaluacion::all(),
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
        ]);

        Olimpiada::create($validated);

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
        ]);

        $olimpiada->update($validated);

        return redirect()->back()->with('success', 'Olimpiada actualizada exitosamente.');
    }

    public function destroy(Olimpiada $olimpiada)
    {
        try {
            $olimpiada->delete();
            return redirect()->back()->with('success', 'Olimpiada eliminada exitosamente.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'No se puede eliminar la olimpiada porque tiene fases u otros registros asociados.');
        }
    }
}
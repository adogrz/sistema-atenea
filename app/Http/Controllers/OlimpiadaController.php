<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Olimpiada;
use App\Models\DefinicionEvaluacion;
use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadaController extends Controller
{
    public function index(Request $request): Response
    {
        $olimpiadas = Olimpiada::with([
            'area',
            'fases' => function ($query) {
                $query->orderBy('orden', 'asc');
            },
            'fases.definicionEvaluacion'
        ])
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        return Inertia::render('olympics/index', [
            'olimpiadas' => $olimpiadas,
            'areas' => Area::all(),
            'definiciones_evaluacion' => DefinicionEvaluacion::all(),
        ]);
    }

    public function showGestionEvaluacion(): Response
    {
        $olimpiadas = Olimpiada::with([
            'fases.itemsDefinidos.calificadores' => function ($query) {
                $query->select('users.id', 'users.name'); // Select only needed fields
            }
        ])->orderBy('nombre')->get();

        $calificadores = User::role('calificador')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Olimpiadas/GestionEvaluacion', [
            'olimpiadas' => $olimpiadas,
            'calificadores' => $calificadores,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'area_id' => ['required', 'integer', 'exists:areas,id'],
            'activa' => ['required', 'boolean'],
        ]);

        Olimpiada::create($validated);

        return redirect()->route('olimpiadas.index')->with('success', 'Olimpiada creada exitosamente.');
    }

    public function update(Request $request, Olimpiada $olimpiada)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'area_id' => ['required', 'integer', 'exists:areas,id'],
            'activa' => ['required', 'boolean'],
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
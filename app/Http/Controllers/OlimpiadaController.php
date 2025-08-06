<?php

namespace App\Http\Controllers;

use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OlimpiadaController extends Controller
{
    /**
     * Muestra el listado de olimpiadas.
     */
    public function index(): Response
    {
        $olimpiadas = Olimpiada::with('fases')->orderByDesc('fecha_inicio')->get();

        return Inertia::render('Olympics', [
            'olimpiadas' => $olimpiadas,
        ]);
    }

    /**
     * Muestra el formulario de creación.
     */
    public function create(): Response
    {
        return Inertia::render('Olympics/Create');
    }

    /**
     * Guarda una nueva olimpiada.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'area_academica' => 'required|string|max:100',
            'activa' => 'boolean',
        ]);

        Olimpiada::create($request->only([
            'nombre',
            'descripcion',
            'fecha_inicio',
            'fecha_fin',
            'area_academica',
            'activa',
        ]));

        return redirect()->route('olimpiadas.index')->with('success', 'Olimpiada creada correctamente.');
    }

    /**
     * Muestra los detalles de una olimpiada.
     */
    public function show(Olimpiada $olimpiada): Response
    {
        $olimpiada->load('fases');

        return Inertia::render('Olympics/Show', [
            'olimpiada' => $olimpiada,
        ]);
    }

    /**
     * Actualiza la olimpiada.
     */
    public function update(Request $request, Olimpiada $olimpiada)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'area_academica' => 'required|string|max:100',
            'activa' => 'boolean',
        ]);

        $olimpiada->update($request->only([
            'nombre',
            'descripcion',
            'fecha_inicio',
            'fecha_fin',
            'area_academica',
            'activa',
        ]));

        return redirect()->route('olimpiadas.index')->with('success', 'Olimpiada actualizada correctamente.');
    }

    /**
     * Elimina la olimpiada.
     */
    public function destroy(Olimpiada $olimpiada)
    {
        $olimpiada->delete();

        return redirect()->route('olimpiadas.index')->with('success', 'Olimpiada eliminada correctamente.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Grupo;
use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class GrupoController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $gruposQuery = Grupo::with('area');

        // If user is not an admin, filter by their area.
        if (!$user->hasRole('admin-ti')) {
            $areaId = $user->primaryArea()->id ?? null;

            // If user has no area, they see no groups.
            // Otherwise, they see groups from their area.
            $gruposQuery->where('area_id', $areaId);
        }

        $grupos = $gruposQuery->latest()->get();

        return Inertia::render('Grupos/Index', ['grupos' => $grupos]);
    }

    public function create()
    {
        $areas = Area::all();
        $userAreaId = Auth::user()->primaryArea()->id ?? null;
        return Inertia::render('Grupos/Form', ['areas' => $areas, 'userAreaId' => $userAreaId]);
    }

    public function store(Request $request)
    {
        $userAreaId = Auth::user()->primaryArea()->id ?? null;
        if (!$userAreaId) {
            return redirect()->back()->withErrors(['area_id' => 'El usuario no tiene un área principal asignada.']);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'horario' => 'required|in:mañana,tarde',
        ]);

        Grupo::create(array_merge($validated, ['area_id' => $userAreaId]));

        return redirect()->route('grupos.index')->with('success', 'Grupo creado exitosamente.');
    }

    public function edit(Grupo $grupo)
    {
        $grupo->load('area');
        $areas = Area::all();
        $userAreaId = Auth::user()->primaryArea()->id ?? null;
        return Inertia::render('Grupos/Form', [
            'grupo' => $grupo,
            'areas' => $areas,
            'userAreaId' => $userAreaId,
        ]);
    }

    public function update(Request $request, Grupo $grupo)
    {
        $userAreaId = Auth::user()->primaryArea()->id ?? null;
        if (!$userAreaId || $grupo->area_id !== $userAreaId) {
            return redirect()->back()->withErrors(['area_id' => 'No tienes permiso para modificar grupos fuera de tu área principal.']);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'horario' => 'required|in:mañana,tarde',
        ]);

        $grupo->update($validated);

        return redirect()->route('grupos.index')->with('success', 'Grupo actualizado exitosamente.');
    }

    public function destroy(Grupo $grupo)
    {
        $userAreaId = Auth::user()->primaryArea()->id ?? null;
        if (!$userAreaId || $grupo->area_id !== $userAreaId) {
            return redirect()->back()->withErrors(['area_id' => 'No tienes permiso para eliminar grupos fuera de tu área principal.']);
        }
        $grupo->delete();
        return redirect()->route('grupos.index')->with('success', 'Grupo eliminado exitosamente.');
    }
}

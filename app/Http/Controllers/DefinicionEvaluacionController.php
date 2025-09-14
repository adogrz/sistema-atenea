<?php

namespace App\Http\Controllers;

use App\Models\DefinicionEvaluacion;
use App\Models\FaseOlimpiada;
use App\Models\ItemDefinido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DefinicionEvaluacionController extends Controller
{
    public function index()
    {
        $definiciones = DefinicionEvaluacion::withCount('itemsDefinidos')->get();
        return Inertia::render('definiciones-evaluacion/index', [
            'definiciones' => $definiciones,
        ]);
    }

    public function create()
    {
        $fases = FaseOlimpiada::orderBy('nombre')->get();
        return Inertia::render('definiciones-evaluacion/create', [
            'fases' => $fases,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'in:borrador,publicada,archivada'],
            'bloqueada' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.nombre' => ['required', 'string', 'max:255'],
            'items.*.descripcion' => ['nullable', 'string'],
            'items.*.puntaje_maximo' => ['required', 'numeric', 'min:0'],
            'items.*.orden' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($request) {
            $definicion = DefinicionEvaluacion::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'estado' => $request->estado,
                'bloqueada' => $request->bloqueada ?? false,
                'creada_por' => Auth::id(),
            ]);

            foreach ($request->items as $itemData) {
                $definicion->itemsDefinidos()->create($itemData);
            }
        });

        return redirect()->route('definiciones-evaluacion.index')->with('success', 'Definición de evaluación creada exitosamente.');
    }

    public function show(DefinicionEvaluacion $definicionEvaluacion)
    {
        // Not typically used for Inertia, but can return JSON if needed
        return response()->json($definicionEvaluacion);
    }

    public function edit(DefinicionEvaluacion $definicionEvaluacion)
    {
        $definicionEvaluacion->load('itemsDefinidos');
        $fases = FaseOlimpiada::orderBy('nombre')->get();
        return Inertia::render('definiciones-evaluacion/edit', [
            'definicion' => $definicionEvaluacion,
            'fases' => $fases,
        ]);
    }

    public function update(Request $request, DefinicionEvaluacion $definicionEvaluacion)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'in:borrador,publicada,archivada'],
            'bloqueada' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'integer', 'exists:items_definidos,id'], // For existing items
            'items.*.nombre' => ['required', 'string', 'max:255'],
            'items.*.descripcion' => ['nullable', 'string'],
            'items.*.puntaje_maximo' => ['required', 'numeric', 'min:0'],
            'items.*.orden' => ['required', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($request, $definicionEvaluacion) {
            $definicionEvaluacion->update([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'estado' => $request->estado,
                'bloqueada' => $request->bloqueada ?? false,
            ]);

            $existingItemIds = $definicionEvaluacion->itemsDefinidos->pluck('id')->toArray();
            $updatedItemIds = [];

            foreach ($request->items as $itemData) {
                if (isset($itemData['id'])) {
                    // Update existing item
                    $item = ItemDefinido::find($itemData['id']);
                    if ($item && $item->definicion_evaluacion_id === $definicionEvaluacion->id) {
                        $item->update($itemData);
                        $updatedItemIds[] = $item->id;
                    }
                } else {
                    // Create new item
                    $newItem = $definicionEvaluacion->itemsDefinidos()->create($itemData);
                    $updatedItemIds[] = $newItem->id;
                }
            }

            // Delete items that were removed from the request
            $itemsToDelete = array_diff($existingItemIds, $updatedItemIds);
            ItemDefinido::whereIn('id', $itemsToDelete)->delete();
        });

        return redirect()->route('definiciones-evaluacion.index')->with('success', 'Definición de evaluación actualizada exitosamente.');
    }

    public function all()
    {
        return response()->json(DefinicionEvaluacion::orderBy('nombre')->get());
    }

    public function destroy(DefinicionEvaluacion $definicionEvaluacion)
    {
        $definicionEvaluacion->delete();
        return redirect()->route('definiciones-evaluacion.index')->with('success', 'Definición de evaluación eliminada exitosamente.');
    }
}
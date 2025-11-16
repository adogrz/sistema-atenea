<?php

namespace App\Http\Controllers;

use App\Models\DefinicionEvaluacion;
use App\Models\ItemDefinido;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DefinicionEvaluacionController extends Controller
{
    public function index(Request $request)
    {
        $definiciones = DefinicionEvaluacion::with('itemsDefinidos')->get();
        return Inertia::render('Olimpiadas/DefinicionesEvaluacion/Index', [
            'definiciones' => $definiciones,
        ]);
    }

    public function create()
    {
        return Inertia::render('Olimpiadas/DefinicionesEvaluacion/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'version' => 'required|integer|min:1',
            'estado' => 'required|in:borrador,publicada,archivada',
            'bloqueada' => 'required|boolean',
            'items' => 'required|array|min:1',
            'items.*.nombre' => 'required|string|max:255',
            'items.*.descripcion' => 'nullable|string',
            'items.*.orden' => 'required|integer',
            'items.*.puntos_maximos' => 'required|numeric|min:0.01',
        ], [
            'items.required' => 'Debes agregar al menos un ítem a la evaluación.',
            'items.min' => 'Debes agregar al menos un ítem a la evaluación.',
            'items.*.puntos_maximos.min' => 'Los puntos máximos para cada ítem deben ser mayores a 0.',
        ]);

        DB::beginTransaction();
        try {
            $definicion = DefinicionEvaluacion::create([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'],
                'version' => $validated['version'],
                'creada_por' => auth()->id(),
                'estado' => $validated['estado'],
                'bloqueada' => $validated['bloqueada'],
            ]);

            if (isset($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    $definicion->itemsDefinidos()->create($itemData);
                }
            }

            DB::commit();
            return redirect()->route('definiciones-evaluacion.index')
                ->with('success', 'Definición de evaluación creada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al crear la definición de evaluación: ' . $e->getMessage()]);
        }
    }

    public function edit(DefinicionEvaluacion $definicionEvaluacion)
    {
        $definicionEvaluacion->load('itemsDefinidos');
        return Inertia::render('Olimpiadas/DefinicionesEvaluacion/Form', [
            'definicionEvaluacion' => $definicionEvaluacion,
        ]);
    }

    public function update(Request $request, DefinicionEvaluacion $definicionEvaluacion)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'version' => 'required|integer|min:1',
            'estado' => 'required|in:borrador,publicada,archivada',
            'bloqueada' => 'required|boolean',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:items_definidos,id',
            'items.*.nombre' => 'required|string|max:255',
            'items.*.descripcion' => 'nullable|string',
            'items.*.orden' => 'required|integer',
            'items.*.puntos_maximos' => 'required|numeric|min:0.01',
        ], [
            'items.required' => 'Debes agregar al menos un ítem a la evaluación.',
            'items.min' => 'Debes agregar al menos un ítem a la evaluación.',
            'items.*.puntos_maximos.min' => 'Los puntos máximos para cada ítem deben ser mayores a 0.',
        ]);

        // Enforcement: Prevent updates if the definition is blocked
        if ($definicionEvaluacion->bloqueada) {
            return back()->withErrors(['bloqueada' => 'No se puede actualizar una definición de evaluación bloqueada.']);
        }

        DB::beginTransaction();
        try {
            $definicionEvaluacion->update([
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'],
                'version' => $validated['version'],
                'estado' => $validated['estado'],
                'bloqueada' => $validated['bloqueada'],
            ]);

            $existingItemIds = $definicionEvaluacion->itemsDefinidos->pluck('id')->toArray();
            $updatedItemIds = [];

            if (isset($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    if (isset($itemData['id'])) {
                        // Update existing item
                        $item = $definicionEvaluacion->itemsDefinidos()->where('id', $itemData['id'])->first();
                        if ($item) {
                            $item->update($itemData);
                            $updatedItemIds[] = $item->id;
                        }
                    } else {
                        // Create new item
                        $newItem = $definicionEvaluacion->itemsDefinidos()->create($itemData);
                        $updatedItemIds[] = $newItem->id;
                    }
                }
            }

            // Delete items that were removed from the form
            $itemsToDelete = array_diff($existingItemIds, $updatedItemIds);
            ItemDefinido::whereIn('id', $itemsToDelete)->delete();

            DB::commit();
            return redirect()->route('definiciones-evaluacion.index')
                ->with('success', 'Definición de evaluación actualizada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al actualizar la definición de evaluación: ' . $e->getMessage()]);
        }
    }

    public function destroy(DefinicionEvaluacion $definicionEvaluacion)
    {
        DB::beginTransaction();
        try {
            $definicionEvaluacion->itemsDefinidos()->delete(); // Delete associated items
            $definicionEvaluacion->delete();
            DB::commit();
            return redirect()->route('definiciones-evaluacion.index')
                ->with('success', 'Definición de evaluación eliminada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al eliminar la definición de evaluación: ' . $e->getMessage()]);
        }
    }
}

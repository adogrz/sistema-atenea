<?php

namespace App\Http\Controllers;

use App\Models\DefinicionEvaluacion;
use App\Models\ItemDefinido;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DefinicionEvaluacionController extends Controller
{
    public function index()
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
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'estado' => 'required|boolean',
            'bloqueada' => 'required|boolean',
            'items' => 'nullable|array',
            'items.*.nombre' => 'required|string|max:255',
            'items.*.descripcion' => 'nullable|string',
            'items.*.orden' => 'required|integer',
            'items.*.obligatorio' => 'required|boolean',
            'items.*.ponderacion' => 'required|numeric',
            'items.*.puntaje_maximo' => 'required|numeric',
        ]);

        DB::beginTransaction();
        try {
            $definicion = DefinicionEvaluacion::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'creada_por' => auth()->id(),
                'estado' => $request->estado,
                'bloqueada' => $request->bloqueada,
            ]);

            foreach ($request->items as $itemData) {
                $definicion->itemsDefinidos()->create($itemData);
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
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'estado' => 'required|boolean',
            'bloqueada' => 'required|boolean',
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|exists:items_definidos,id',
            'items.*.nombre' => 'required|string|max:255',
            'items.*.descripcion' => 'nullable|string',
            'items.*.orden' => 'required|integer',
            'items.*.obligatorio' => 'required|boolean',
            'items.*.ponderacion' => 'required|numeric',
            'items.*.puntaje_maximo' => 'required|numeric',
        ]);

        DB::beginTransaction();
        try {
            $definicionEvaluacion->update([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'estado' => $request->estado,
                'bloqueada' => $request->bloqueada,
            ]);

            $existingItemIds = $definicionEvaluacion->itemsDefinidos->pluck('id')->toArray();
            $updatedItemIds = [];

            foreach ($request->items as $itemData) {
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

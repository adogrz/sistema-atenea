<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CalificadorItemAsignado;
use App\Models\FaseOlimpiada;
use App\Models\Olimpiada;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\DefinicionEvaluacion;
use Inertia\Inertia;

class AsignacionCalificadorController extends Controller
{
    public function index()
    {
        $olimpiadas = Olimpiada::with([
            'fases.definicionEvaluacion.itemsDefinidos.calificadores' => function ($query) {
                $query->select('users.id', 'users.name'); // Select only needed fields
            }
        ])->orderBy('nombre')->get();

        $calificadores = User::role('calificador')->orderBy('name')->get(['id', 'name']);
        $definicionesEvaluacion = DefinicionEvaluacion::all();

        return Inertia::render('Olimpiadas/GestionEvaluacion', [
            'olimpiadas' => $olimpiadas,
            'calificadores' => $calificadores,
            'definicionesEvaluacion' => $definicionesEvaluacion,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'calificador_id' => ['required', 'integer', 'exists:users,id'],
            'assignments' => ['required', 'array'],
            'assignments.*.fase_id' => ['required', 'integer', 'exists:fases_olimpiadas,id'],
            'assignments.*.item_id' => ['required', 'integer', 'exists:items_definidos,id'],
            'assignments.*.assigned' => ['required', 'boolean'],
        ]);

        $calificadorId = $request->input('calificador_id');

        foreach ($request->input('assignments') as $assignment) {
            if ($assignment['assigned']) {
                CalificadorItemAsignado::updateOrCreate([
                    'calificador_id' => $calificadorId,
                    'fase_olimpiada_id' => $assignment['fase_id'],
                    'item_definido_id' => $assignment['item_id'],
                ]);
            } else {
                CalificadorItemAsignado::where('calificador_id', $calificadorId)
                    ->where('fase_olimpiada_id', $assignment['fase_id'])
                    ->where('item_definido_id', $assignment['item_id'])
                    ->delete();
            }
        }

        return back()->with('success', 'Asignaciones guardadas correctamente.');
    }

    public function syncForItem(Request $request)
    {
        $request->validate([
            'fase_olimpiada_id' => ['required', 'integer', 'exists:fases_olimpiadas,id'],
            'item_definido_id' => ['required', 'integer', 'exists:items_definidos,id'],
            'calificador_ids' => ['present', 'array'],
            'calificador_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $faseId = $request->input('fase_olimpiada_id');
        $itemId = $request->input('item_definido_id');
        $calificadorIds = $request->input('calificador_ids');

        // Start a transaction to ensure atomicity
        DB::transaction(function () use ($faseId, $itemId, $calificadorIds) {
            // 1. Delete all existing assignments for this item in this phase
            CalificadorItemAsignado::where('fase_olimpiada_id', $faseId)
                ->where('item_definido_id', $itemId)
                ->delete();

            // 2. Create the new assignments
            $newAssignments = [];
            foreach ($calificadorIds as $calificadorId) {
                $newAssignments[] = [
                    'fase_olimpiada_id' => $faseId,
                    'item_definido_id' => $itemId,
                    'calificador_id' => $calificadorId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($newAssignments)) {
                CalificadorItemAsignado::insert($newAssignments);
            }
        });

        return response()->json(['success' => true, 'message' => 'Asignaciones actualizadas.']);
    }
}

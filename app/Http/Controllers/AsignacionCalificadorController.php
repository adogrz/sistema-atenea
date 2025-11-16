<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CalificadorItemAsignado;
use App\Models\FaseOlimpiada;
use App\Models\Olimpiada;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\DefinicionEvaluacion;
use Inertia\Inertia;

class AsignacionCalificadorController extends Controller
{
    public function index()
    {
        $olimpiadas = Olimpiada::with([
            'fases.definicionEvaluacion.itemsDefinidos',
            'area',
            'nivelEducativo'
        ])->orderBy('nombre')->get();

        // Cargar los calificadores asignados para cada item en cada fase
        foreach ($olimpiadas as $olimpiada) {
            foreach ($olimpiada->fases as $fase) {
                if ($fase->definicionEvaluacion && $fase->definicionEvaluacion->itemsDefinidos) {
                    foreach ($fase->definicionEvaluacion->itemsDefinidos as $item) {
                        // Cargar calificadores específicos de esta fase y este item
                        $item->calificadores = User::select('users.id', 'users.name')
                            ->join('calificador_item_asignado', 'users.id', '=', 'calificador_item_asignado.calificador_id')
                            ->where('calificador_item_asignado.fase_olimpiada_id', $fase->id)
                            ->where('calificador_item_asignado.item_definido_id', $item->id)
                            ->get();
                        
                        Log::info('Loaded calificadores for item', [
                            'fase_id' => $fase->id,
                            'item_id' => $item->id,
                            'calificadores_count' => $item->calificadores->count()
                        ]);
                    }
                }
            }
        }

        $calificadores = User::role('calificador')->with('areas')->orderBy('name')->get(['id', 'name']);
        $definicionesEvaluacion = DefinicionEvaluacion::with('itemsDefinidos')->get();

        $assignmentsData = $this->getAllAssignmentsData();

        return Inertia::render('Olimpiadas/GestionEvaluacion', [
            'olimpiadas' => $olimpiadas,
            'calificadores' => $calificadores,
            'definicionesEvaluacion' => $definicionesEvaluacion,
            'allAssignments' => $assignmentsData['allAssignments'],
            'chartsData' => $assignmentsData['chartsData'],
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

        Log::info('Sync for item', [
            'fase_id' => $faseId,
            'item_id' => $itemId,
            'calificador_ids' => $calificadorIds
        ]);

        // Start a transaction to ensure atomicity
        DB::transaction(function () use ($faseId, $itemId, $calificadorIds) {
            // 1. Delete all existing assignments for this item in this phase
            $deleted = CalificadorItemAsignado::where('fase_olimpiada_id', $faseId)
                ->where('item_definido_id', $itemId)
                ->delete();
            
            Log::info('Deleted assignments', ['count' => $deleted]);

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
                Log::info('Inserted assignments', ['count' => count($newAssignments)]);
            }
        });

        return redirect()->back()->with('success', 'Asignaciones actualizadas.');
    }

    public function getAllAssignmentsData()
    {
        $assignments = CalificadorItemAsignado::with([
            'calificador:id,name',
            'itemDefinido:id,nombre',
            'faseOlimpiada:id,nombre,olimpiada_id',
            'faseOlimpiada.olimpiada:id,nombre,area_id,anio,created_at,tipo',
            'faseOlimpiada.olimpiada.area:id,name',
        ])->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'calificador_id' => $assignment->calificador_id,
                'calificador_name' => $assignment->calificador->name,
                'item_definido_id' => $assignment->item_definido_id,
                'item_definido_nombre' => $assignment->itemDefinido->nombre,
                'fase_olimpiada_id' => $assignment->fase_olimpiada_id,
                'fase_olimpiada_nombre' => $assignment->faseOlimpiada->nombre,
                'olimpiada_id' => $assignment->faseOlimpiada->olimpiada_id,
                'olimpiada_nombre' => $assignment->faseOlimpiada->olimpiada->nombre,
                'olimpiada_tipo' => $assignment->faseOlimpiada->olimpiada->tipo,
                'area_id' => $assignment->faseOlimpiada->olimpiada->area_id,
                'area_name' => $assignment->faseOlimpiada->olimpiada->area->name,
                'year' => $assignment->faseOlimpiada->olimpiada->anio,
                'created_at' => $assignment->created_at,
            ];
        });

        // Aggregate data for charts
        $assignmentsByYearAndArea = $assignments->groupBy('year')
            ->map(function ($yearAssignments) {
                return $yearAssignments->groupBy('area_name')
                    ->map(fn ($areaAssignments) => $areaAssignments->count());
            });

        $assignmentsByYearAndCalificador = $assignments->groupBy('year')
            ->map(function ($yearAssignments) {
                return $yearAssignments->groupBy('calificador_name')
                    ->map(fn ($calificadorAssignments) => $calificadorAssignments->count());
            });

        $totalAssignmentsByYear = $assignments->groupBy('year')
            ->map(fn ($yearAssignments) => $yearAssignments->count());

        return [
            'allAssignments' => $assignments,
            'chartsData' => [
                'assignmentsByYearAndArea' => $assignmentsByYearAndArea,
                'assignmentsByYearAndCalificador' => $assignmentsByYearAndCalificador,
                'totalAssignmentsByYear' => $totalAssignmentsByYear,
            ],
        ];
    }
}
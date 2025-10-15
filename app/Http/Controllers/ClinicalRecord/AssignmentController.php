<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicalRecord\ListAssignmentsRequest;
use App\Http\Requests\ClinicalRecord\StoreAssignmentRequest;
use App\Http\Requests\ClinicalRecord\UpdateAssignmentRequest;
use App\Models\Assignment;
use App\Services\ClinicalRecord\AssignmentFilter;
use App\Services\ClinicalRecord\EntitySearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function __construct(
        private AssignmentFilter $filter,
        private EntitySearchService $searchService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(ListAssignmentsRequest $request): Response
    {
        $this->authorize('viewAny', Assignment::class);

        $user = $request->user();
        $filters = $request->getFilters();

        // Construir query con relaciones optimizadas
        $query = Assignment::query()
            ->with(['student:nie,primer_nombre,segundo_nombre,primer_apellido,segundo_apellido',
                    'professional:id,name,sede_name']);

        // Aplicar filtros
        $query = $this->filter->applyRoleFilters($query, $user);
        $query = $this->filter->applyRequestFilters($query, $filters);

        if ($filters['search']) {
            $query = $this->filter->applySearch($query, $filters['search']);
        }

        // Ordenamiento y paginación
        $assignments = $query
            ->orderBy($filters['sort_by'], $filters['sort_order'])
            ->paginate($filters['per_page'])
            ->withQueryString();

        return Inertia::render('clinical-records/assignments/dashboard-assignments', [
            'assignments' => $assignments,
            'filters' => $filters,
            'permissions' => $this->getUserPermissions($user),
        ]);
    }

    /**
     * Obtener permisos del usuario de forma centralizada.
     */
    private function getUserPermissions($user): array
    {
        return [
            'canManageMedical' => $user->can('assignments:manage-medical'),
            'canManagePsychological' => $user->can('assignments:manage-psychological'),
            'canCreate' => $user->can('create', Assignment::class),
            'isManager' => $user->canManageAssignments(),
        ];
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->authorize('create', Assignment::class);

        $user = $request->user();

        return Inertia::render('clinical-records/assignments/create-assignment', [
            'permissions' => $this->getUserPermissions($user),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAssignmentRequest $request)
    {
        try {
            DB::beginTransaction();

            $assignment = Assignment::create($request->validated());

            // Cargar relaciones para la respuesta
            $assignment->load(['student', 'professional']);

            DB::commit();

            return redirect()
                ->route('clinical-records.assignments.index')
                ->with('success', 'Asignación creada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Ocurrió un error al crear la asignación: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Assignment $assignment)
    {
        $this->authorize('update', $assignment);

        $assignment->load(['student', 'professional']);
        $user = $request->user();

        return Inertia::render('clinical-records/assignments/edit-assignment', [
            'assignment' => $assignment,
            'permissions' => $this->getUserPermissions($user),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAssignmentRequest $request, Assignment $assignment)
    {
        try {
            DB::beginTransaction();

            $assignment->update($request->validated());

            // Cargar relaciones para la respuesta
            $assignment->load(['student', 'professional']);

            DB::commit();

            return redirect()
                ->route('clinical-records.assignments.index')
                ->with('success', 'Asignación actualizada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Ocurrió un error al actualizar la asignación: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Assignment $assignment)
    {
        $this->authorize('delete', $assignment);

        try {
            DB::beginTransaction();

            $assignment->delete();

            DB::commit();

            return redirect()
                ->route('clinical-records.assignments.index')
                ->with('success', 'Asignación eliminada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al eliminar la asignación: ' . $e->getMessage()]);
        }
    }

    /**
     * Buscar estudiantes para asignación.
     */
    public function searchStudents(Request $request): JsonResponse
    {
        $search = $request->input('search', '');
        $limit = $request->input('limit', 10);

        $results = $this->searchService->searchStudents($search, $limit);

        return response()->json($results);
    }

    /**
     * Buscar profesionales para asignación.
     */
    public function searchProfessionals(Request $request): JsonResponse
    {
        $user = $request->user();
        $search = $request->input('search', '');
        $type = $request->input('type', 'medical');
        $limit = $request->input('limit', 10);

        // Filtrar por sede del jefe - solo mostrar profesionales de su misma sede
        // Esto previene asignaciones cross-sede que causarían que las asignaciones desaparezcan del dashboard
        $sedeName = $user->sede_name;

        $results = $this->searchService->searchProfessionals($search, $type, $sedeName, $limit);

        return response()->json($results);
    }
}

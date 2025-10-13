<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicalRecord\ListAssignmentsRequest;
use App\Models\Assignment;
use App\Services\ClinicalRecord\AssignmentFilter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function __construct(
        private AssignmentFilter $filter
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
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

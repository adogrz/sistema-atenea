<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        // Autorización usando la policy
        $this->authorize('viewAny', Assignment::class);

        // Validar parámetros de búsqueda/filtrado
        $validated = $request->validate([
            'student_nie' => 'nullable|string|exists:estudiantes,nie',
            'professional_id' => 'nullable|integer|exists:users,id',
            'type' => 'nullable|in:' . Assignment::TYPE_MEDICAL . ',' . Assignment::TYPE_PSYCHOLOGICAL,
            'is_active' => 'nullable|boolean',
            'search' => 'nullable|string|max:100',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|in:created_at,updated_at,student_nie,type',
            'sort_order' => 'nullable|in:asc,desc',
        ]);

        $user = $request->user();

        // Construir query base
        $query = Assignment::query()
            ->with(['student', 'professional.sede']);

        // Aplicar filtros según el rol
        $query = $this->applyRoleFilters($query, $user);

        // Aplicar filtros del request
        $this->applyRequestFilters($query, $validated);

        // Búsqueda general
        if (!empty($validated['search'])) {
            $this->applySearch($query, $validated['search']);
        }

        // Ordenamiento
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortOrder = $validated['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        $perPage = $validated['per_page'] ?? 15;
        $assignments = $query->paginate($perPage)->withQueryString();

        $canManageMedical = $user->can('assignments:manage-medical');
        $canManagePsychological = $user->can('assignments:manage-psychological');
        $isManager = $canManageMedical || $canManagePsychological;

        return Inertia::render('clinical-records/assignments/dashboard-assignments', [
            'assignments' => $assignments,
            'filters' => $validated,
            'permissions' => [
                'canManageMedical' => $canManageMedical,
                'canManagePsychological' => $canManagePsychological,
                'canCreate' => $user->can('create', Assignment::class),
                'isManager' => $isManager,
            ],
        ]);
    }

    /**
     * Aplicar filtros según el rol del usuario.
     */
    private function applyRoleFilters($query, $user)
    {
        $canManageMedical = $user->can('assignments:manage-medical');
        $canManagePsychological = $user->can('assignments:manage-psychological');

        // Si es profesional (no jefe), solo sus asignaciones
        if (!$canManageMedical && !$canManagePsychological) {
            return $query->forProfessional($user->id);
        }

        // Si es jefe, filtrar por sede
        if ($user->sede_name) {
            $query->whereHas('professional', function ($q) use ($user) {
                $q->where('sede_name', $user->sede_name);
            });
        }

        // Si solo maneja un tipo, filtrar por ese tipo
        if ($canManageMedical && !$canManagePsychological) {
            $query->medical();
        } elseif ($canManagePsychological && !$canManageMedical) {
            $query->psychological();
        }

        return $query;
    }

    /**
     * Aplicar filtros del request.
     */
    private function applyRequestFilters($query, array $filters): void
    {
        if (!empty($filters['student_nie'])) {
            $query->forStudent($filters['student_nie']);
        }

        if (!empty($filters['professional_id'])) {
            $query->forProfessional($filters['professional_id']);
        }

        if (isset($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (isset($filters['is_active'])) {
            $filters['is_active'] ? $query->active() : $query->where('is_active', false);
        }
    }

    /**
     * Aplicar búsqueda general.
     */
    private function applySearch($query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('student_nie', 'like', "%{$search}%")
                ->orWhereHas('student', function ($sq) use ($search) {
                    $sq->whereRaw("CONCAT(primer_nombre, ' ', primer_apellido) like ?", ["%{$search}%"])
                        ->orWhereRaw("CONCAT(segundo_nombre, ' ', segundo_apellido) like ?", ["%{$search}%"]);
                })
                ->orWhereHas('professional', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                });
        });
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

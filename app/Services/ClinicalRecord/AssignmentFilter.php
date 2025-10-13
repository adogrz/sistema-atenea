<?php

namespace App\Services\ClinicalRecord;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AssignmentFilter
{
    /**
     * Aplicar filtros basados en el rol del usuario.
     */
    public function applyRoleFilters(Builder $query, User $user): Builder
    {
        // Si es profesional (no jefe), solo sus asignaciones
        if (!$user->canManageAssignments()) {
            return $query->forProfessional($user->id);
        }

        // Si es jefe, filtrar por sede
        if ($user->sede_name) {
            $query->bySede($user->sede_name);
        }

        // Si solo maneja un tipo específico, filtrar por ese tipo
        if ($user->managesOnlyMedical()) {
            $query->medical();
        } elseif ($user->managesOnlyPsychological()) {
            $query->psychological();
        }

        return $query;
    }

    /**
     * Aplicar filtros del request.
     */
    public function applyRequestFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['student_nie'] ?? null, fn($q, $nie) => $q->forStudent($nie))
            ->when($filters['professional_id'] ?? null, fn($q, $id) => $q->forProfessional($id))
            ->when($filters['type'] ?? null, fn($q, $type) => $q->byType($type))
            ->when(isset($filters['is_active']), fn($q) => 
                $filters['is_active'] ? $q->active() : $q->inactive()
            );
    }

    /**
     * Aplicar búsqueda general insensible a mayúsculas y acentos.
     */
    public function applySearch(Builder $query, string $search): Builder
    {
        if (empty(trim($search))) {
            return $query;
        }

        $normalizedSearch = $this->normalizeSearchTerm($search);

        return $query->where(function ($q) use ($search, $normalizedSearch) {
            $q->where('student_nie', 'like', "%{$search}%")
                ->orWhereHas('student', fn($sq) => $this->searchStudent($sq, $normalizedSearch))
                ->orWhereHas('professional', fn($pq) => $this->searchProfessional($pq, $normalizedSearch));
        });
    }

    /**
     * Búsqueda en datos del estudiante.
     */
    private function searchStudent(Builder $query, string $normalizedSearch): void
    {
        $query->whereRaw(
            "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                CONCAT(COALESCE(primer_nombre, ''), ' ', COALESCE(segundo_nombre, ''), ' ', 
                       COALESCE(primer_apellido, ''), ' ', COALESCE(segundo_apellido, ''))
            , 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')) LIKE ?",
            ["%{$normalizedSearch}%"]
        );
    }

    /**
     * Búsqueda en datos del profesional.
     */
    private function searchProfessional(Builder $query, string $normalizedSearch): void
    {
        $query->whereRaw(
            "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')) LIKE ?",
            ["%{$normalizedSearch}%"]
        );
    }

    /**
     * Normalizar término de búsqueda.
     */
    private function normalizeSearchTerm(string $term): string
    {
        $term = mb_strtolower($term, 'UTF-8');
        
        $replacements = [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'Á' => 'a', 'É' => 'e', 'Í' => 'i', 'Ó' => 'o', 'Ú' => 'u',
            'ñ' => 'n', 'Ñ' => 'n', 'ü' => 'u', 'Ü' => 'u',
        ];
        
        return str_replace(array_keys($replacements), array_values($replacements), $term);
    }
}

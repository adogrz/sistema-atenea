<?php

namespace App\Services\ClinicalRecord;

use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class EntitySearchService
{
    /**
     * Buscar estudiantes por nombre o NIE.
     */
    public function searchStudents(string $search, ?int $limit = 10): Collection
    {
        if (empty(trim($search))) {
            return collect([]);
        }

        $normalizedSearch = $this->normalizeSearchTerm($search);

        return Estudiante::query()
            ->select('nie', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido')
            ->where(function (Builder $query) use ($search, $normalizedSearch) {
                // Búsqueda por NIE (exacta o parcial)
                $query->where('nie', 'like', "%{$search}%")
                    // Búsqueda por nombre completo (insensible a acentos)
                    ->orWhereRaw(
                        "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                            CONCAT(COALESCE(primer_nombre, ''), ' ', COALESCE(segundo_nombre, ''), ' ',
                                   COALESCE(primer_apellido, ''), ' ', COALESCE(segundo_apellido, ''))
                        , 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')) LIKE ?",
                        ["%{$normalizedSearch}%"]
                    );
            })
            ->limit($limit)
            ->get()
            ->map(function (Estudiante $student) {
                return [
                    'value' => $student->nie,
                    'label' => $this->getStudentFullName($student),
                    'sublabel' => "NIE: {$student->nie}",
                ];
            });
    }

    /**
     * Buscar profesionales por nombre, filtrado por tipo y sede.
     */
    public function searchProfessionals(
        string $search,
        string $type,
        ?string $sedeName = null,
        ?int $limit = 10
    ): Collection {
        if (empty(trim($search))) {
            return collect([]);
        }

        $normalizedSearch = $this->normalizeSearchTerm($search);

        // Determinar el permiso requerido según el tipo
        $requiredPermission = $type === 'medical'
            ? 'medical-records:view'
            : 'psychological-records:view';

        return User::query()
            ->select('id', 'name', 'sede_name')
            ->whereHas('roles', function (Builder $query) use ($type) {
                // Filtrar por rol según el tipo de asignación
                if ($type === 'medical') {
                    $query->where('name', 'doctor');
                } elseif ($type === 'psychological') {
                    $query->where('name', 'psicologo');
                }
            })
            ->when($sedeName, function (Builder $query, string $sede) {
                // Filtrar por sede si se proporciona
                $query->where('sede_name', $sede);
            })
            ->where(function (Builder $query) use ($normalizedSearch) {
                // Búsqueda por nombre (insensible a acentos)
                $query->whereRaw(
                    "LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')) LIKE ?",
                    ["%{$normalizedSearch}%"]
                );
            })
            ->limit($limit)
            ->get()
            ->filter(function (User $professional) use ($requiredPermission) {
                // Filtrar solo usuarios con el permiso requerido
                return $professional->can($requiredPermission);
            })
            ->map(function (User $professional) {
                return [
                    'value' => (string) $professional->id,
                    'label' => $professional->name,
                    'sublabel' => $professional->sede_name ? "Sede: {$professional->sede_name}" : null,
                ];
            })
            ->values(); // Reiniciar las claves del array
    }

    /**
     * Obtener el nombre completo de un estudiante.
     */
    private function getStudentFullName(Estudiante $student): string
    {
        $parts = array_filter([
            $student->primer_nombre,
            $student->segundo_nombre,
            $student->primer_apellido,
            $student->segundo_apellido,
        ]);

        return implode(' ', $parts);
    }

    /**
     * Normalizar término de búsqueda (remover acentos y convertir a minúsculas).
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

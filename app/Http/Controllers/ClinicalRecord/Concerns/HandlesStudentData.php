<?php

namespace App\Http\Controllers\ClinicalRecord\Concerns;

use App\Models\Estudiante;

trait HandlesStudentData
{
    /**
     * Obtiene y prepara los datos del estudiante para el frontend.
     *
     * @param string $studentNie
     * @param string|null $consentType Tipo de consentimiento a filtrar ('medical', 'psychological', o null para todos)
     * @return array
     */
    protected function prepareStudentData(string $studentNie, ?string $consentType = null): array
    {
        $student = Estudiante::with([
            'responsable',
            'responsables',
            'consentForms' => function ($query) use ($consentType) {
                if ($consentType) {
                    $query->where('type', $consentType);
                }
                $query->orderBy('granted_at', 'desc');
            }
        ])
            ->where('nie', $studentNie)
            ->firstOrFail();

        return [
            'student' => $this->formatStudentForFrontend($student),
            'responsables' => $this->formatResponsablesForFrontend($student),
            'existing_consents' => $this->formatConsentsForFrontend($student),
            'is_minor' => $student->isMinor(),
        ];
    }

    /**
     * Formatea los datos del estudiante para el frontend.
     *
     * @param Estudiante $student
     * @return array
     */
    protected function formatStudentForFrontend(Estudiante $student): array
    {
        return [
            'nie' => $student->nie,
            'codigo' => $student->codigo,
            'primer_nombre' => $student->primer_nombre,
            'segundo_nombre' => $student->segundo_nombre,
            'primer_apellido' => $student->primer_apellido,
            'segundo_apellido' => $student->segundo_apellido,
            'fecha_nacimiento' => $student->fecha_nacimiento->format('Y-m-d'),
            'sexo' => $student->sexo,
            'email' => $student->email ?? null,
        ];
    }

    /**
     * Formatea los responsables del estudiante para el frontend.
     *
     * @param Estudiante $student
     * @return array
     */
    protected function formatResponsablesForFrontend(Estudiante $student): array
    {
        // Obtener responsables (soporta múltiples o uno solo)
        $responsables = $student->responsables && $student->responsables->count() > 0
            ? $student->responsables
            : ($student->responsable ? collect([$student->responsable]) : collect());

        return $responsables->map(function ($r) {
            return [
                'id' => $r->id,
                'dui' => $r->dui,
                'nombres_responsable' => $r->nombres_responsable,
                'apellidos_responsable' => $r->apellidos_responsable,
            ];
        })->values()->toArray();
    }

    /**
     * Formatea los consentimientos existentes para el frontend.
     *
     * @param Estudiante $student
     * @return array
     */
    protected function formatConsentsForFrontend(Estudiante $student): array
    {
        return $student->consentForms->map(function ($consent) {
            return [
                'id' => $consent->id,
                'granted_at' => $consent->granted_at->format('Y-m-d'),
                'responsible_name' => $consent->responsible
                    ? "{$consent->responsible->nombres_responsable} {$consent->responsible->apellidos_responsable}"
                    : 'N/A',
            ];
        })->toArray();
    }
}


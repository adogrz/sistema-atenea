<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use Illuminate\Foundation\Http\FormRequest;

class ListAssignmentsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // La autorización se maneja en el controlador con policies
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'student_nie' => 'nullable|string|exists:estudiantes,nie',
            'professional_id' => 'nullable|integer|exists:users,id',
            'type' => 'nullable|in:' . Assignment::TYPE_MEDICAL . ',' . Assignment::TYPE_PSYCHOLOGICAL,
            'is_active' => 'nullable|boolean',
            'search' => 'nullable|string|max:100',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|in:created_at,updated_at,student_nie,type',
            'sort_order' => 'nullable|in:asc,desc',
        ];
    }

    /**
     * Get validated data with default values.
     */
    public function getFilters(): array
    {
        return [
            'student_nie' => $this->input('student_nie'),
            'professional_id' => $this->input('professional_id'),
            'type' => $this->input('type'),
            // Por defecto mostrar todas las asignaciones (activas e inactivas)
            'is_active' => $this->input('is_active'),
            'search' => $this->input('search'),
            'per_page' => $this->input('per_page', 15),
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_order' => $this->input('sort_order', 'desc'),
        ];
    }
}

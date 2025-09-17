<?php

namespace App\Http\Requests;

use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Delegar la autorización al Policity de Assignment
        return match ($this->getMethod()) {
            'POST' => $this->user()->can('create', Assignment::class),
            'PUT', 'PATCH' => $this->user()->can('update', $this->route('assignment')),
            'DELETE' => $this->user()->can('delete', $this->route('assignment')),
            default => false,
        };
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'student_nie' => ['required', 'string', 'exists:estudiantes,nie'],
            'professional_id' => ['required', 'exists:users,id'],
            'type' => ['required', Rule::in([Assignment::TYPE_MEDICAL, Assignment::TYPE_PSYCHOLOGICAL])],
            'is_active' => ['sometimes', 'boolean'],
        ];

        // Validación adicional para evitar duplicados activos
        if ($this->isMethod('POST')) {
            $rules['student_nie'][] = Rule::unique('assignments')
                ->where('type', $this->input('type'))
                ->where('is_active', true)
                ->whereNull('deleted_at');
        }

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $assignmentId = $this->route('assignment')?->id;
            $rules['student_nie'][] = Rule::unique('assignments')
                ->where('type', $this->input('type'))
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->ignore($assignmentId);
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'student_nie.required' => 'Debe seleccionar un estudiante.',
            'student_nie.exists' => 'El estudiante seleccionado no existe.',
            'student_nie.unique' => 'El estudiante ya tiene una asignación activa de este tipo.',
            'professional_id.required' => 'Debe seleccionar un profesional.',
            'professional_id.exists' => 'El profesional seleccionado no existe.',
            'type.required' => 'Debe especificar el tipo de asignación.',
            'type.in' => 'El tipo de asignación debe ser medical o psychological.',
        ];
    }
}

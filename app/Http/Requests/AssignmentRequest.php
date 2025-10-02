<?php

namespace App\Http\Requests;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'student_nie' => ['required', 'string', 'exists:estudiantes,nie'],
            'professional_id' => [
                'required', 
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    if (!$this->validateProfessionalPermissions($value)) {
                        $fail('El profesional seleccionado no tiene los permisos necesarios para este tipo de asignación.');
                    }
                },
            ],
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
     * Valida que el profesional tenga los permisos necesarios según el tipo de asignación.
     *
     * @param int $professionalId
     * @return bool
     */
    protected function validateProfessionalPermissions(int $professionalId): bool
    {
        $professional = User::find($professionalId);
        
        if (!$professional) {
            return false;
        }

        $type = $this->input('type');
        
        return match ($type) {
            Assignment::TYPE_MEDICAL => $professional->can('medical-records:view'),
            Assignment::TYPE_PSYCHOLOGICAL => $professional->can('psychological-records:view'),
            default => false,
        };
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
            'is_active.boolean' => 'El estado activo debe ser verdadero o falso.',
        ];
    }
}

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
            'change_justification' => ['nullable', 'string', 'max:1000'],
        ];

        // Para UPDATE: requerir justificación si cambian campos críticos
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $assignment = $this->route('assignment');

            // Si cambió el profesional, tipo o se desactivó, requerir justificación
            if ($this->hasChangedCriticalFields($assignment)) {
                $rules['change_justification'] = ['required', 'string', 'min:10', 'max:1000'];
            }
        }

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
     * Verifica si se cambió algún campo crítico que requiere justificación.
     *
     * @param Assignment|null $assignment
     * @return bool
     */
    protected function hasChangedCriticalFields(?Assignment $assignment): bool
    {
        if (!$assignment) {
            return false;
        }

        // Verificar si cambió el profesional asignado
        if ($this->has('professional_id') && $this->input('professional_id') != $assignment->professional_id) {
            return true;
        }

        // Verificar si cambió el tipo de asignación
        if ($this->has('type') && $this->input('type') !== $assignment->type) {
            return true;
        }

        // Verificar si se desactivó la asignación
        if ($this->has('is_active') && !$this->input('is_active') && $assignment->is_active) {
            return true;
        }

        return false;
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
            'type.in' => 'El tipo de asignación debe ser médica o psicológica.',
            'is_active.boolean' => 'El estado activo debe ser verdadero o falso.',
            'change_justification.required' => 'Debe proporcionar una justificación para este cambio crítico.',
            'change_justification.min' => 'La justificación debe tener al menos 10 caracteres.',
            'change_justification.max' => 'La justificación no puede exceder los 1000 caracteres.',
        ];
    }
}

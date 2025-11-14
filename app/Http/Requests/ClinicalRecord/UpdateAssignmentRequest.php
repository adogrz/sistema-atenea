<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $assignment = $this->route('assignment');
        return $this->user()->can('update', $assignment);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $assignmentId = $this->route('assignment')->id;

        return [
            'professional_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'is_active' => 'required|boolean',
            'change_justification' => [
                'nullable',
                'string',
                'min:10',
                'max:1000',
                // Requerida solo si se está desactivando
                Rule::requiredIf(function () {
                    return $this->input('is_active') === false || $this->input('is_active') === '0';
                }),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'professional_id.required' => 'Debe seleccionar un profesional.',
            'professional_id.exists' => 'El profesional seleccionado no existe.',
            'is_active.required' => 'Debe especificar el estado de la asignación.',
            'change_justification.required' => 'Debe proporcionar una justificación para desactivar esta asignación.',
            'change_justification.min' => 'La justificación debe tener al menos 10 caracteres.',
            'change_justification.max' => 'La justificación no puede exceder los 1000 caracteres.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $assignment = $this->route('assignment');

            // Validar que el profesional tenga los permisos correctos según el tipo
            $professionalId = $this->input('professional_id');
            $professional = User::find($professionalId);

            if ($professional) {
                // Validar que el profesional pueda ver expedientes del tipo correcto
                if ($assignment->type === Assignment::TYPE_MEDICAL && !$professional->can('medical-records:view')) {
                    $validator->errors()->add('professional_id', 'El profesional seleccionado no tiene permisos para ver expedientes médicos.');
                }

                if ($assignment->type === Assignment::TYPE_PSYCHOLOGICAL && !$professional->can('psychological-records:view')) {
                    $validator->errors()->add('professional_id', 'El profesional seleccionado no tiene permisos para ver expedientes psicológicos.');
                }
            }

            // Validar justificación si hay cambios críticos
            $hasChanges = $this->hasCriticalChanges($assignment);
            if ($hasChanges) {
                $justification = $this->input('change_justification');

                if (empty($justification) || trim($justification) === '') {
                    $validator->errors()->add('change_justification', 'Debe proporcionar una justificación para este cambio.');
                } elseif (strlen(trim($justification)) < 10) {
                    $validator->errors()->add('change_justification', 'La justificación debe tener al menos 10 caracteres.');
                }
            }
        });
    }

    /**
     * Verificar si hay cambios críticos que requieren justificación.
     */
    protected function hasCriticalChanges(Assignment $assignment): bool
    {
        // Cambió el profesional asignado
        if ($this->input('professional_id') != $assignment->professional_id) {
            return true;
        }

        // Se desactivó la asignación
        if ($this->input('is_active') === false && $assignment->is_active) {
            return true;
        }

        return false;
    }
}

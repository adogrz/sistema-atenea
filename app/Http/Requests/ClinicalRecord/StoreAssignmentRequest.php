<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Models\ClinicalRecord\Assignment;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Assignment::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'student_nie' => [
                'required',
                'string',
                'exists:estudiantes,nie',
                // Validar que no exista una asignación activa del mismo tipo para este estudiante
                Rule::unique('assignments', 'student_nie')
                    ->where('type', $this->input('type'))
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'professional_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'type' => [
                'required',
                'in:' . Assignment::TYPE_MEDICAL . ',' . Assignment::TYPE_PSYCHOLOGICAL,
            ],
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_nie.required' => 'El NIE del estudiante es requerido.',
            'student_nie.exists' => 'El estudiante seleccionado no existe.',
            'student_nie.unique' => 'Ya existe una asignación activa de este tipo para este estudiante.',
            'professional_id.required' => 'Debe seleccionar un profesional.',
            'professional_id.exists' => 'El profesional seleccionado no existe.',
            'type.required' => 'El tipo de asignación es requerido.',
            'type.in' => 'El tipo de asignación no es válido.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Asegurar que is_active tenga un valor por defecto
        if (!$this->has('is_active')) {
            $this->merge(['is_active' => true]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validar que el profesional tenga los permisos correctos según el tipo
            $professionalId = $this->input('professional_id');
            $professional = User::find($professionalId);

            if ($professional) {
                $type = $this->input('type');

                // Validar que el profesional pueda ver expedientes del tipo correcto
                if ($type === Assignment::TYPE_MEDICAL && !$professional->can('medical-records:view')) {
                    $validator->errors()->add('professional_id', 'El profesional seleccionado no tiene permisos para ver expedientes médicos.');
                }

                if ($type === Assignment::TYPE_PSYCHOLOGICAL && !$professional->can('psychological-records:view')) {
                    $validator->errors()->add('professional_id', 'El profesional seleccionado no tiene permisos para ver expedientes psicológicos.');
                }
            }
        });
    }
}

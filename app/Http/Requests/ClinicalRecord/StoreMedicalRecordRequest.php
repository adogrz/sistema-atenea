<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Http\Requests\ClinicalRecord\Concerns\ValidatesConsentForm;
use App\Models\ClinicalRecord\MedicalRecord;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMedicalRecordRequest extends FormRequest
{
    use ValidatesConsentForm;
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', MedicalRecord::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(
            $this->rulesForRecord(),
            $this->rulesForConsultation(),
            $this->rulesForConsent()
        );
    }

    /**
     * Reglas de validación para el expediente médico.
     *
     * @return array<string, mixed>
     */
    protected function rulesForRecord(): array
    {
        return [
            'student_nie' => [
                'required',
                'string',
                'exists:estudiantes,nie',
                Rule::unique('medical_records', 'student_nie'),
            ],
            'general_background' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    /**
     * Reglas de validación para la consulta médica inicial.
     * La consulta es obligatoria al crear un expediente.
     *
     * @return array<string, mixed>
     */
    protected function rulesForConsultation(): array
    {
        return [
            // Datos de la consulta inicial
            'consultation.consultation_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'consultation.diagnosis' => [
                'required',
                'string',
                'max:5000',
            ],
            'consultation.treatment' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'consultation.observations' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(
            [
                // Mensajes para el expediente médico
                'student_nie.required' => 'El NIE del estudiante es requerido.',
                'student_nie.exists' => 'El estudiante seleccionado no existe.',
                'student_nie.unique' => 'Este estudiante ya tiene un expediente médico registrado.',
                'general_background.max' => 'Los antecedentes generales no pueden superar los 5000 caracteres.',

                // Mensajes para la consulta médica
                'consultation.consultation_date.required' => 'La fecha de consulta es requerida.',
                'consultation.consultation_date.date' => 'La fecha de consulta debe ser una fecha válida.',
                'consultation.consultation_date.before_or_equal' => 'La fecha de consulta no puede ser futura.',
                'consultation.diagnosis.required' => 'El diagnóstico es requerido.',
                'consultation.diagnosis.max' => 'El diagnóstico no puede superar los 5000 caracteres.',
                'consultation.treatment.max' => 'El tratamiento no puede superar los 5000 caracteres.',
                'consultation.observations.max' => 'Las observaciones no pueden superar los 5000 caracteres.',
            ],
            $this->consentValidationMessages()
        );
    }
}

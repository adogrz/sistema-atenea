<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Models\ClinicalRecord\MedicalConsultation;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalConsultationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        // Obtener la consulta médica de la ruta
        $consultation = $this->route('consultation');

        if (!$consultation instanceof MedicalConsultation) {
            return false;
        }

        // Verificar permiso de actualización usando la policy
        return $user->can('update', $consultation);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Datos de la consulta (medical_record_id y doctor_id NO se pueden cambiar)
            'consultation_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'diagnosis' => [
                'required',
                'string',
                'max:5000',
            ],
            'treatment' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'observations' => [
                'nullable',
                'string',
                'max:5000',
            ],

            // Justificación REQUERIDA para cualquier actualización
            'change_justification' => [
                'required',
                'string',
                'min:10',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Mensajes para la consulta médica
            'consultation_date.required' => 'La fecha de consulta es requerida.',
            'consultation_date.date' => 'La fecha de consulta debe ser una fecha válida.',
            'consultation_date.before_or_equal' => 'La fecha de consulta no puede ser futura.',
            'diagnosis.required' => 'El diagnóstico es requerido.',
            'diagnosis.max' => 'El diagnóstico no puede superar los 5000 caracteres.',
            'treatment.max' => 'El tratamiento no puede superar los 5000 caracteres.',
            'observations.max' => 'Las observaciones no pueden superar los 5000 caracteres.',

            // Mensajes para la justificación
            'change_justification.required' => 'La justificación del cambio es requerida.',
            'change_justification.min' => 'La justificación debe tener al menos 10 caracteres.',
            'change_justification.max' => 'La justificación no puede superar los 1000 caracteres.',
        ];
    }
}

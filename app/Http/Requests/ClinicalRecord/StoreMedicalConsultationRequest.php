<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Http\Requests\ClinicalRecord\Concerns\ValidatesConsentForm;
use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\ClinicalRecord\MedicalRecord;
use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalConsultationRequest extends FormRequest
{
    use ValidatesConsentForm;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        // Verificar permiso básico de creación
        if (!$user->can('create', MedicalConsultation::class)) {
            return false;
        }

        // Obtener el expediente médico al que se añadirá la consulta
        $medicalRecordId = $this->input('medical_record_id') ?? $this->route('medical_record');
        $medicalRecord = $medicalRecordId ? MedicalRecord::find($medicalRecordId) : null;

        if (!$medicalRecord) {
            return false; // No se puede crear consulta sin expediente válido
        }

        // Reutiliza la lógica de la policy del expediente
        // Si puedes ver el expediente, puedes crear consultas en él
        return $user->can('view', $medicalRecord);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(
            $this->rulesForConsultation(),
            $this->rulesForConsent()
        );
    }

    /**
     * Reglas de validación para la consulta médica.
     *
     * @return array<string, mixed>
     */
    protected function rulesForConsultation(): array
    {
        return [
            // Referencia al expediente médico
            'medical_record_id' => [
                'required',
                'integer',
                'exists:medical_records,id',
            ],

            // Datos de la consulta
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
                'medical_record_id.required' => 'El expediente médico es requerido.',
                'medical_record_id.exists' => 'El expediente médico seleccionado no existe.',

                // Mensajes para la consulta médica
                'consultation_date.required' => 'La fecha de consulta es requerida.',
                'consultation_date.date' => 'La fecha de consulta debe ser una fecha válida.',
                'consultation_date.before_or_equal' => 'La fecha de consulta no puede ser futura.',
                'diagnosis.required' => 'El diagnóstico es requerido.',
                'diagnosis.max' => 'El diagnóstico no puede superar los 5000 caracteres.',
                'treatment.max' => 'El tratamiento no puede superar los 5000 caracteres.',
                'observations.max' => 'Las observaciones no pueden superar los 5000 caracteres.',
            ],
            $this->consentValidationMessages()
        );
    }

    /**
     * Prepare the data for validation.
     * Agrega el student_nie para la validación del consentimiento.
     */
    protected function prepareForValidation(): void
    {
        $medicalRecordId = $this->input('medical_record_id') ?? $this->route('medical_record');

        if ($medicalRecordId) {
            $medicalRecord = MedicalRecord::find($medicalRecordId);
            if ($medicalRecord) {
                $this->merge([
                    'student_nie' => $medicalRecord->student_nie,
                ]);
            }
        }
    }
}
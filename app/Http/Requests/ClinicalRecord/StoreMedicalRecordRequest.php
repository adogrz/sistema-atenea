<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Models\ClinicalRecord\MedicalRecord;
use App\Models\Responsable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMedicalRecordRequest extends FormRequest
{
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
     * Reglas de validación para el consentimiento informado.
     * El consentimiento es obligatorio solo si el estudiante es menor de edad.
     * Puede ser un consentimiento existente (consent_form_id) o uno nuevo.
     *
     * @return array<string, mixed>
     */
    protected function rulesForConsent(): array
    {
        return [
            // Campo que indica si el estudiante es menor de edad (viene del controlador)
            'is_minor' => [
                'required',
                'boolean',
            ],

            // Si es menor, debe proporcionar un consent_form_id O crear uno nuevo
            'consent_form_id' => [
                'nullable',
                'integer',
                'exists:consent_forms,id',
                // Si es menor y no hay consent_form_id, debe proporcionar datos para crear uno nuevo
                function ($attribute, $value, $fail) {
                    if ($this->input('is_minor') && !$value && !$this->has('consent')) {
                        $fail('Para menores de edad es obligatorio asociar o crear un consentimiento informado.');
                    }
                },
            ],

            // Datos para crear un nuevo consentimiento (si no se proporciona consent_form_id)
            'consent' => [
                'required_if:is_minor,true',
                'nullable',
                'array',
            ],
            'consent.responsible_id' => [
                'required_with:consent',
                'integer',
                'exists:responsables,id',
                // Validar que el responsable esté asociado al estudiante
                function ($attribute, $value, $fail) {
                    if ($value && $this->input('student_nie')) {
                        $responsible = Responsable::with('estudiante')->find($value);
                        $studentNie = $this->input('student_nie');

                        if (!$responsible || !$responsible->estudiante || $responsible->estudiante->nie !== $studentNie) {
                            $fail('El responsable seleccionado no está asociado al estudiante.');
                        }
                    }
                },
            ],
            'consent.type' => [
                'required_with:consent',
                'string',
                'in:medical',
            ],
            'consent.granted_at' => [
                'required_with:consent',
                'date',
                'before_or_equal:today',
            ],
            'consent.file' => [
                'required_with:consent',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240', // 10MB máximo
            ],
            'consent.observations' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
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

            // Mensajes para el consentimiento
            'is_minor.required' => 'No se pudo determinar si el estudiante es menor de edad.',
            'is_minor.boolean' => 'El campo de menor de edad debe ser verdadero o falso.',
            'consent_form_id.exists' => 'El consentimiento seleccionado no existe.',
            'consent.required_if' => 'Para menores de edad es obligatorio proporcionar un consentimiento informado.',
            'consent.array' => 'Los datos del consentimiento deben ser un objeto válido.',
            'consent.responsible_id.required_with' => 'El responsable es requerido para crear un consentimiento.',
            'consent.responsible_id.exists' => 'El responsable seleccionado no existe.',
            'consent.type.required_with' => 'El tipo de consentimiento es requerido.',
            'consent.type.in' => 'El tipo de consentimiento debe ser médico.',
            'consent.granted_at.required_with' => 'La fecha de otorgamiento del consentimiento es requerida.',
            'consent.granted_at.date' => 'La fecha de otorgamiento debe ser una fecha válida.',
            'consent.granted_at.before_or_equal' => 'La fecha de otorgamiento no puede ser futura.',
            'consent.file.required_with' => 'El archivo del consentimiento es requerido.',
            'consent.file.file' => 'Debe proporcionar un archivo válido.',
            'consent.file.mimes' => 'El archivo debe ser PDF, JPG, JPEG o PNG.',
            'consent.file.max' => 'El archivo no puede superar los 10MB.',
            'consent.observations.max' => 'Las observaciones no pueden superar los 2000 caracteres.',
        ];
    }
}

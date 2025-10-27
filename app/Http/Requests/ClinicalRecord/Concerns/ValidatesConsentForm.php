<?php

namespace App\Http\Requests\ClinicalRecord\Concerns;

use App\Models\Responsable;

trait ValidatesConsentForm
{
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
            // Campo que indica si el estudiante es menor de edad
            'is_minor' => [
                'required',
                'boolean',
            ],

            // Si es menor, debe proporcionar un consent_form_id o crear uno nuevo
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
                'in:medical,psychological',
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
     * Mensajes de validación personalizados para el consentimiento.
     *
     * @return array<string, string>
     */
    protected function consentValidationMessages(): array
    {
        return [
            'is_minor.required' => 'No se pudo determinar si el estudiante es menor de edad.',
            'is_minor.boolean' => 'El campo de menor de edad debe ser verdadero o falso.',
            'consent_form_id.exists' => 'El consentimiento seleccionado no existe.',
            'consent.required_if' => 'Para menores de edad es obligatorio proporcionar un consentimiento informado.',
            'consent.array' => 'Los datos del consentimiento deben ser un objeto válido.',
            'consent.responsible_id.required_with' => 'El responsable es requerido para crear un consentimiento.',
            'consent.responsible_id.exists' => 'El responsable seleccionado no existe.',
            'consent.type.required_with' => 'El tipo de consentimiento es requerido.',
            'consent.type.in' => 'El tipo de consentimiento debe ser médico o psicológico.',
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

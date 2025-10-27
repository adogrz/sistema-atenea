<?php

namespace App\Http\Requests\ClinicalRecord;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $medicalRecord = $this->route('medical_record');
        return $this->user()->can('update', $medicalRecord);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'general_background' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'justification' => [
                'required',
                'string',
                'min:10', // Forzar una justificación mínimamente descriptiva.
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
            'general_background.max' => 'Los antecedentes generales no pueden superar los 5000 caracteres.',
            'justification.required' => 'La justificación del cambio es requerida.',
            'justification.min' => 'La justificación debe tener al menos 10 caracteres.',
            'justification.max' => 'La justificación no puede superar los 1000 caracteres.',
        ];
    }
}

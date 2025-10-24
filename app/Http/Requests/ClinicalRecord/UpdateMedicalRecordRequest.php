<?php

namespace App\Http\Requests;

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
            'change_justification' => [
                'required',
                'string',
                'min:10', // Forzar una justificación mínimamente descriptiva.
                'max:500',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'change_justification.required' => 'Se requiere una justificación para guardar los cambios.',
            'change_justification.min' => 'La justificación debe tener al menos 10 caracteres.',
        ];
    }
}

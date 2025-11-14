<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Models\ClinicalRecord\PsychologicalSession;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePsychologicalSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        // Obtener la sesión psicológica de la ruta
        $session = $this->route('session');

        if (!$session instanceof PsychologicalSession) {
            return false;
        }

        // Verificar permiso de actualización usando la policy
        return $user->can('update', $session);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Datos de la sesión (psychological_record_id y psychologist_id NO se pueden cambiar)
            'session_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'session_content' => [
                'required',
                'string',
                'max:5000',
            ],
            'test_results' => [
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
            // Mensajes para la sesión psicológica
            'session_date.required' => 'La fecha de sesión es requerida.',
            'session_date.date' => 'La fecha de sesión debe ser una fecha válida.',
            'session_date.before_or_equal' => 'La fecha de sesión no puede ser futura.',
            'session_content.required' => 'El contenido de la sesión es requerido.',
            'session_content.max' => 'El contenido de la sesión no puede superar los 5000 caracteres.',
            'test_results.max' => 'Los resultados de pruebas no pueden superar los 5000 caracteres.',
            'observations.max' => 'Las observaciones no pueden superar los 5000 caracteres.',

            // Mensajes para la justificación
            'change_justification.required' => 'La justificación del cambio es requerida.',
            'change_justification.min' => 'La justificación debe tener al menos 10 caracteres.',
            'change_justification.max' => 'La justificación no puede superar los 1000 caracteres.',
        ];
    }
}

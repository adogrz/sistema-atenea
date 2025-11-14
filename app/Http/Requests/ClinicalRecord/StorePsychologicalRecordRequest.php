<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Http\Requests\ClinicalRecord\Concerns\ValidatesConsentForm;
use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\PsychologicalRecord;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePsychologicalRecordRequest extends FormRequest
{
    use ValidatesConsentForm;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', PsychologicalRecord::class);
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
            $this->rulesForSession(),
            $this->rulesForConsent()
        );
    }

    /**
     * Reglas de validación para el expediente psicológico.
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
                Rule::unique('psychological_records', 'student_nie'),
                // Validar que el psicólogo esté asignado al estudiante
                function ($attribute, $value, $fail) {
                    $user = $this->user();

                    // Si el usuario no tiene el permiso para ver todos los expedientes,
                    // debe tener una asignación activa con el estudiante
                    if (!$user->can('psychological-records:view-all')) {
                        $hasAssignment = Assignment::where('student_nie', $value)
                            ->where('professional_id', $user->id)
                            ->where('type', Assignment::TYPE_PSYCHOLOGICAL)
                            ->where('is_active', true)
                            ->exists();

                        if (!$hasAssignment) {
                            $fail('No tienes asignación activa con este estudiante para crear un expediente psicológico.');
                        }
                    }
                },
            ],
            'initial_assessment' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    /**
     * Reglas de validación para la sesión psicológica inicial.
     * La sesión es obligatoria al crear un expediente.
     *
     * @return array<string, mixed>
     */
    protected function rulesForSession(): array
    {
        return [
            // Datos de la sesión inicial
            'session.session_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'session.session_content' => [
                'required',
                'string',
                'max:5000',
            ],
            'session.test_results' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'session.observations' => [
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
                // Mensajes para el expediente psicológico
                'student_nie.required' => 'El NIE del estudiante es requerido.',
                'student_nie.exists' => 'El estudiante seleccionado no existe.',
                'student_nie.unique' => 'Este estudiante ya tiene un expediente psicológico registrado.',
                'initial_assessment.max' => 'La evaluación inicial no puede superar los 5000 caracteres.',

                // Mensajes para la sesión psicológica
                'session.session_date.required' => 'La fecha de sesión es requerida.',
                'session.session_date.date' => 'La fecha de sesión debe ser una fecha válida.',
                'session.session_date.before_or_equal' => 'La fecha de sesión no puede ser futura.',
                'session.session_content.required' => 'El contenido de la sesión es requerido.',
                'session.session_content.max' => 'El contenido de la sesión no puede superar los 5000 caracteres.',
                'session.test_results.max' => 'Los resultados de pruebas no pueden superar los 5000 caracteres.',
                'session.observations.max' => 'Las observaciones no pueden superar los 5000 caracteres.',
            ],
            $this->consentValidationMessages()
        );
    }
}

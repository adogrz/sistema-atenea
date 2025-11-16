<?php

namespace App\Http\Requests\ClinicalRecord;

use App\Http\Requests\ClinicalRecord\Concerns\ValidatesConsentForm;
use App\Models\ClinicalRecord\PsychologicalRecord;
use App\Models\ClinicalRecord\PsychologicalSession;
use Illuminate\Foundation\Http\FormRequest;

class StorePsychologicalSessionRequest extends FormRequest
{
    use ValidatesConsentForm;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        // Verificar permiso básico de creación
        if (!$user->can('create', PsychologicalSession::class)) {
            return false;
        }

        // Obtener el expediente psicológico al que se añadirá la sesión
        $psychologicalRecordId = $this->input('psychological_record_id') ?? $this->route('psychological_record');
        $psychologicalRecord = $psychologicalRecordId ? PsychologicalRecord::find($psychologicalRecordId) : null;

        if (!$psychologicalRecord) {
            return false; // No se puede crear sesión sin expediente válido
        }

        // Reutiliza la lógica de la policy del expediente
        // Si puedes ver el expediente, puedes crear sesiones en él
        return $user->can('view', $psychologicalRecord);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_merge(
            $this->rulesForSession(),
            $this->rulesForConsent()
        );
    }

    /**
     * Reglas de validación para la sesión psicológica.
     *
     * @return array<string, mixed>
     */
    protected function rulesForSession(): array
    {
        return [
            // Referencia al expediente psicológico
            'psychological_record_id' => [
                'required',
                'integer',
                'exists:psychological_records,id',
            ],

            // Datos de la sesión
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
                'psychological_record_id.required' => 'El expediente psicológico es requerido.',
                'psychological_record_id.exists' => 'El expediente psicológico seleccionado no existe.',

                // Mensajes para la sesión psicológica
                'session_date.required' => 'La fecha de sesión es requerida.',
                'session_date.date' => 'La fecha de sesión debe ser una fecha válida.',
                'session_date.before_or_equal' => 'La fecha de sesión no puede ser futura.',
                'session_content.required' => 'El contenido de la sesión es requerido.',
                'session_content.max' => 'El contenido de la sesión no puede superar los 5000 caracteres.',
                'test_results.max' => 'Los resultados de pruebas no pueden superar los 5000 caracteres.',
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
        $psychologicalRecordId = $this->input('psychological_record_id') ?? $this->route('psychological_record');

        if ($psychologicalRecordId) {
            $psychologicalRecord = PsychologicalRecord::find($psychologicalRecordId);
            if ($psychologicalRecord) {
                $this->merge([
                    'student_nie' => $psychologicalRecord->student_nie,
                ]);
            }
        }
    }
}

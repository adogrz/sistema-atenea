<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscripcionOlimpiadaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user
            && $user->estudiante
            && $user->estudiante->codigo === $this->input('codigo_estudiante');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fase_id' => ['required', 'integer', 'exists:fases_olimpiadas,id'],
            'codigo_estudiante' => [
                'required',
                'string',
                'exists:estudiantes,codigo',
                Rule::unique('inscripciones_olimpiadas')->where(
                    fn($q) => $q
                        ->where('fase_id', $this->input('fase_id'))
                        ->where('codigo_estudiante', $this->input('codigo_estudiante'))
                        ->whereNull('deleted_at'),
                ),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo_estudiante.unique' => 'Ya existe una inscripción para este estudiante en esta fase.',
        ];
    }
}
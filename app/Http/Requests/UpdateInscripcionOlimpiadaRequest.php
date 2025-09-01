<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInscripcionOlimpiadaRequest extends FormRequest
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
            'estado_id'     => ['nullable', 'integer', 'exists:estados_inscripciones,id'],
            'observaciones' => ['nullable', 'string'],
            'activa'        => ['nullable', 'boolean'],
        ];
    }
}

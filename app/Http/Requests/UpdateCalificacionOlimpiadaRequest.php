<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCalificacionOlimpiadaRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Si usas policies, cámbialo a $this->user()->can('calificar', InscripcionOlimpiada::class)
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_definido_id' => ['required', 'integer', 'exists:items_definidos,id'],
            'items.*.puntaje' => ['required', 'numeric', 'min:0'],
            'items.*.observacion' => ['nullable', 'string', 'max:2000'],
            'finalizar' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Debe enviar al menos un ítem calificado.',
            'items.*.item_definido_id.exists' => 'El ítem definido no existe.',
        ];
    }
}

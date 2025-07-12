<?php

namespace App\Validators;

class CentroEducativoValidator
{
    /*
     * Función encargada de validar la data de las columnas
     */
    public function validate(array $data): array
    {
        $errors = [];

        foreach (['codigo', 'nombre', 'departamento', 'distrito', 'sector', 'zona', 'direccion', 'internacional'] as $key) {
            if (!isset($data[$key]) || trim($data[$key]) === '') {
                $errors[] = ucfirst($key) . ' requerido';
            }
        }

        if (isset($data['sector']) && !in_array($data['sector'], ['PÚBLICO', 'PRIVADO'])) {
            $errors[] = 'Sector inválido';
        }

        if (isset($data['zona']) && !in_array($data['zona'], ['Rural', 'Urbana'])) {
            $errors[] = 'Zona inválida';
        }

        if (isset($data['internacional']) && !in_array($data['internacional'], ['SI', 'NO'])) {
            $errors[] = 'Internacional debe ser SI o NO';
        }

        return $errors;
    }
}

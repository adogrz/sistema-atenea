<?php

namespace App\DataObjects;

class CentroEducativoImportResult
{
    public readonly int $importados;
    public readonly array $errores;
    public readonly string $mensaje;

    public function __construct(int $importados, array $errores = [])
    {
        $this->importados = $importados;
        $this->errores = $errores;
        $this->mensaje = $this->generarMensaje();
    }

    protected function generarMensaje(): string
    {
        if ($this->importados > 0 && empty($this->errores)) {
            return '¡Importación exitosa!';
        }

        if ($this->importados > 0 && !empty($this->errores)) {
            return 'Importación parcial con algunos errores.';
        }

        if ($this->importados === 0 && !empty($this->errores)) {
            return 'No se importaron registros. Revisa los errores.';
        }

        return 'La importación no produjo cambios.';
    }

    public function toArray(): array
    {
        return [
            'mensaje' => $this->mensaje,
            'importados' => $this->importados,
            'errores' => $this->errores,
        ];
    }
}
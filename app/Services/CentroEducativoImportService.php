<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Transformers\CentroEducativoTransformer;
use App\Validators\CentroEducativoValidator;
use App\Models\CentroEducativo;

class CentroEducativoImportService
{
    /* 
     * Función encargada de importar los datos del archivo Excel
     */
    public function import(string $path): array
    {
        $spreadsheet = IOFactory::load($path);
        $rows = $spreadsheet->getActiveSheet()->toArray();

        $transformer = new CentroEducativoTransformer();
        $validator = new CentroEducativoValidator();

        $header = $rows[0];
        $columnIndexes = $transformer->mapHeaders($header);

        $requeridos = ['codigo', 'nombre', 'departamento', 'distrito', 'sector', 'zona', 'direccion', 'internacional'];
        $faltantes = [];

        foreach ($requeridos as $campo) {
            if (!array_key_exists($campo, $columnIndexes)) {
                $faltantes[] = $campo;
            }
        }
        $importados = 0;
        $errores = [];

        if (!empty($faltantes)) {
            return [
                'importados' => 0,
                'errores' => [
                    'El archivo no contiene los siguientes encabezados requeridos:',
                    implode(', ', $faltantes),
                ],
            ];
        }

        foreach ($rows as $i => $row) {
            if ($i === 0) continue;

            // Verificar si la fila está completamente vacía
            if (empty(array_filter($row, fn($value) => trim($value) !== ''))) {
                continue; // Saltar fila vacía
            }

            $data = $transformer->transformRow($row, $columnIndexes);

            $errors = $validator->validate($data);
            if ($errors) {
                $errores[] = "Fila $i: " . implode(', ', $errors);
                continue;
            }

            CentroEducativo::updateOrCreate(
                ['codigo' => $data['codigo']],
                $data
            );

            $importados++;
        }

        if ($importados === 0 && empty($errores)) {
            $errores[] = 'El archivo no contiene datos válidos para importar.';
        }

        return compact('importados', 'errores');
    }
}

<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Transformers\CentroEducativoTransformer;
use App\Validators\CentroEducativoValidator;
use App\Models\CentroEducativo;
use App\DataObjects\CentroEducativoImportResult;

class CentroEducativoImportService
{
    /* 
     * Función encargada de importar los datos del archivo Excel
     */
    public function import(string $path): CentroEducativoImportResult
    {
        $spreadsheet = IOFactory::load($path);
        $rows = $spreadsheet->getActiveSheet()->toArray();

        $transformer = new CentroEducativoTransformer();
        $validator = new CentroEducativoValidator();

        $requeridos = ['codigo', 'nombre', 'departamento', 'distrito', 'sector', 'zona', 'direccion', 'internacional'];
        $columnIndexes = [];
        $startRow = 0;

        //Buscar fila válida de encabezados
        foreach ($rows as $i => $row) {
            $columnIndexes = $transformer->mapHeaders($row);
            if (!empty($columnIndexes)) {
                $startRow = $i + 1; // inicia después del encabezado
                break;
            }
        }

        $faltantes = array_diff($requeridos, array_keys($columnIndexes));

        if (!empty($faltantes)) {
            return new CentroEducativoImportResult(0, [
                'Encabezados faltantes: ' . implode(', ', $faltantes),
            ]);
        }

        $importados = 0;
        $errores = [];

        for ($i = $startRow; $i < count($rows); $i++) {
            $row = $rows[$i];

            if (empty(array_filter($row, fn($value) => trim($value) !== ''))) {
                continue;
            }

            $data = $transformer->transformRow($row, $columnIndexes);
            $errors = $validator->validate($data);

            if ($errors) {
                $errores[] = "Fila " . ($i + 1) . ": " . implode(', ', $errors);
                continue;
            }

            CentroEducativo::updateOrCreate(['codigo' => $data['codigo']], $data);
            $importados++;
        }

        if ($importados === 0 && empty($errores)) {
            $errores[] = 'No se encontraron datos válidos para importar.';
        }

        return new CentroEducativoImportResult($importados, $errores);
    }
}

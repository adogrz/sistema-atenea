<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CentroEducativo;
use PhpOffice\PhpSpreadsheet\IOFactory;

use function Illuminate\Log\log;

class CentroEducativoController extends Controller
{
    /**
     * Muestra el formulario de importación
     */
    public function create()
    {
        return Inertia::render('import-form');
    }

    /**
     * Procesa el archivo Excel y guarda los centros educativos
     */
    public function store(Request $request)
    {
        dump($request);

        $request->validate([
            'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
        ]);

        $file = $request->file('archivo_excel');
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        $importados = 0;
        $errores = [];

        foreach ($rows as $index => $row) {
            // Omitir encabezado si está presente en la primera fila
            if ($index === 0) continue;

            try {
                if (!isset($row[0], $row[1])) {
                    $errores[] = "Fila $index inválida: código o nombre ausente";
                    continue;
                }

                CentroEducativo::updateOrCreate(
                    ['codigo' => $row[0]],
                    [
                        'nombre'        => $row[1],
                        'departamento'  => $row[2] ?? '',
                        'distrito'      => $row[3] ?? '',
                        'sector'        => $row[4] ?? 'PÚBLICO',
                        'zona'          => $row[5] ?? 'Urbana',
                        'direccion'     => $row[6] ?? '',
                        'internacional' => $row[7] ?? 'NO',
                    ]
                );

                $importados++;
            } catch (\Exception $e) {
                $errores[] = "Fila $index error: " . $e->getMessage();
                continue;
            }
        }

        return back()->with([
            'mensaje' => "Se importaron {$importados} centros educativos.",
            'importados' => $importados,
        ]);
    }
}

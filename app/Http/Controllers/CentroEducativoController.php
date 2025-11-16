<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use \App\Services\CentroEducativoImportService;
use Illuminate\Http\JsonResponse;
use App\Transformers\CentroEducativoTransformer; // Added import for Transformer

class CentroEducativoController extends Controller
{
    /**
     * Muestra el formulario de importación y maneja la previsualización del archivo.
     */
    public function create(Request $request)
    {
        $preview = null;
        $headers = null;
        $errors = [];

        if ($request->hasFile('archivo_excel')) {
            $request->validate([
                'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
            ]);

            $path = $request->file('archivo_excel')->getPathname();

            try {
                $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
                $rows = $spreadsheet->getActiveSheet()->toArray();

                $transformer = new CentroEducativoTransformer();
                $headers = $rows[0];
                $columnIndexes = $transformer->mapHeaders($headers);

                // Validar encabezados requeridos
                $requeridos = ['codigo', 'nombre', 'departamento', 'distrito', 'sector', 'zona', 'direccion', 'internacional'];
                $faltantes = array_diff($requeridos, array_keys($columnIndexes));

                if ($faltantes) {
                    $errors[] = 'Faltan columnas requeridas: ' . implode(', ', $faltantes);
                } else {
                    // Transformar las primeras 10 filas para previsualización
                    $preview = [];
                    foreach (array_slice($rows, 1, 10) as $row) {
                        $preview[] = $transformer->transformRow($row, $columnIndexes);
                    }
                }
            } catch (\Exception $e) {
                $errors[] = 'Error al procesar el archivo: ' . $e->getMessage();
            }
        }

        return Inertia::render('CentroEducativo/Import', [
            'preview' => $preview,
            'headers' => $headers,
            'errors' => $errors,
        ]);
    }

    /**
     * Procesa el archivo Excel y guarda los centros educativos
     */
    public function store(Request $request): JsonResponse
    {
        // Limite de tiempo para procesar los registros: Json
        set_time_limit(300); //5 minutos -> Implementar dispatch

        $request->validate([
            'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
        ]);

        $path = $request->file('archivo_excel')->getPathname();
        $resultado = app(CentroEducativoImportService::class)->import($path);

        return response()->json($resultado->toArray());
    }
}

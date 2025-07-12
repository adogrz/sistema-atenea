<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use \App\Services\CentroEducativoImportService;

class CentroEducativoController extends Controller
{
    /**
     * Muestra el formulario de importación
     */
    public function create()
    {
        return Inertia::render('import-form');
    }

    /*
     * Carga la previsualización del archivo
     */
    public function preview(Request $request)
    {
        $request->validate([
            'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
        ]);

        $path = $request->file('archivo_excel')->getPathname();

        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
        $rows = $spreadsheet->getActiveSheet()->toArray();

        $transformer = new \App\Transformers\CentroEducativoTransformer();
        $headers = $rows[0];
        $columnIndexes = $transformer->mapHeaders($headers);

        // Validar encabezados requeridos
        $requeridos = ['codigo', 'nombre', 'departamento', 'distrito', 'sector', 'zona', 'direccion', 'internacional'];
        $faltantes = array_diff($requeridos, array_keys($columnIndexes));

        if ($faltantes) {
            return back()->with([
                'errores' => ['Faltan columnas requeridas: ' . implode(', ', $faltantes)],
            ]);
        }

        // Transformar las primeras 10 filas
        $preview = [];
        foreach (array_slice($rows, 1, 10) as $row) {
            $preview[] = $transformer->transformRow($row, $columnIndexes);
        }

        return Inertia::render('CentroEducativo/PreviewImport', [
            'preview' => $preview,
            'headers' => $headers,
        ]);
    }

    /**
     * Procesa el archivo Excel y guarda los centros educativos
     */
    public function store(Request $request)
    {
        $request->validate([
            'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
        ]);

        $path = $request->file('archivo_excel')->getPathname();

        $resultado = app(CentroEducativoImportService::class)->import($path);

        return back()->with([
            'resultado' => $resultado,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CentroEducativo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use App\Services\CentroEducativoImportService;
use App\Transformers\CentroEducativoTransformer;
use PhpOffice\PhpSpreadsheet\IOFactory;

class CentroEducativoController extends Controller
{
    private const MAX_PREVIEW_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
    private const MAX_IMPORT_FILE_SIZE = 50 * 1024 * 1024;  // 50 MB

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = CentroEducativo::query();

        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where('nombre', 'like', "%{$searchTerm}%")
                  ->orWhere('codigo', 'like', "%{$searchTerm}%")
                  ->orWhere('direccion', 'like', "%{$searchTerm}%");
        }

        $centrosEducativos = $query->paginate(10);

        return Inertia::render('CentrosEducativos/Index', [
            'centrosEducativos' => $centrosEducativos,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('CentrosEducativos/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:255|unique:centros_educativos',
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
        ]);

        CentroEducativo::create($validated);

        return redirect()->route('centros-educativos.index')->with('success', 'Centro Educativo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(CentroEducativo $centroEducativo)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CentroEducativo $centroEducativo)
    {
        return Inertia::render('CentrosEducativos/Edit', [
            'centroEducativo' => $centroEducativo,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CentroEducativo $centroEducativo)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:255|unique:centros_educativos,codigo,' . $centroEducativo->id,
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
        ]);

        $centroEducativo->update($validated);

        return redirect()->route('centros-educativos.index')->with('success', 'Centro Educativo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CentroEducativo $centroEducativo)
    {
        try {
            $centroEducativo->delete();
            return redirect()->back()->with('success', 'Centro Educativo eliminado exitosamente.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'No se puede eliminar el centro educativo porque tiene registros asociados.');
        }
    }

    /**
     * Muestra el formulario de importación y maneja la previsualización del archivo.
     */
    public function importCreate(Request $request)
    {
        ini_set('memory_limit', '512M');
        set_time_limit(300);

        $preview = null;
        $headers = null;
        $errors = [];
        $totalRows = 0;

        if ($request->hasFile('archivo_excel')) {
            $request->validate([
                'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
            ]);

            $uploadedFile = $request->file('archivo_excel');
            $fileSize = $uploadedFile->getSize();

            if ($fileSize > self::MAX_PREVIEW_FILE_SIZE) {
                $errors[] = 'El archivo es demasiado grande para la previsualización (' . round($fileSize / (1024 * 1024), 2) . 'MB). El tamaño máximo permitido es ' . round(self::MAX_PREVIEW_FILE_SIZE / (1024 * 1024), 2) . 'MB.';
                return Inertia::render('CentroEducativo/Import', [
                    'preview' => $preview,
                    'headers' => $headers,
                    'errors' => $errors,
                    'totalRows' => $totalRows,
                ]);
            }

            $path = $uploadedFile->getPathname();

            try {
                $reader = IOFactory::createReaderForFile($path);
                $reader->setReadDataOnly(true);
                $spreadsheet = $reader->load($path);

                $sheet = $spreadsheet->getActiveSheet();
                $totalRows = $sheet->getHighestRow() - 1;
                $transformer = new CentroEducativoTransformer();
                
                $headerRowIterator = $sheet->getRowIterator(1, 1);
                
                if (!$headerRowIterator->valid()) {
                    throw new \Exception('El archivo Excel está vacío o no se puede leer la fila de encabezado.');
                }
                $headerRow = $headerRowIterator->current();

                $headers = [];
                foreach ($headerRow->getCellIterator() as $cell) {
                    $headers[] = $cell->getValue();
                }
                $columnIndexes = $transformer->mapHeaders($headers);

                $requeridos = ['codigo', 'nombre', 'departamento', 'distrito', 'sector', 'zona', 'direccion', 'internacional'];
                $faltantes = array_diff($requeridos, array_keys($columnIndexes));

                if ($faltantes) {
                    $errors[] = 'Faltan columnas requeridas: ' . implode(', ', $faltantes);
                } else {
                    $preview = [];
                    $rowIterator = $sheet->getRowIterator(2, 11);
                    foreach ($rowIterator as $row) {
                        $cellIterator = $row->getCellIterator();
                        $cellIterator->setIterateOnlyExistingCells(FALSE); 
                        $rowData = [];
                        foreach ($cellIterator as $cell) {
                            $rowData[] = $cell->getValue();
                        }
                        if (count(array_filter($rowData)) == 0) continue;
                        
                        $preview[] = $transformer->transformRow($rowData, $columnIndexes);
                    }
                }
            } catch (\Throwable $th) {
                logger()->error("Error processing excel file for preview: " . $th->getMessage());
                
                $errorMessage = 'Ocurrió un error inesperado al leer el archivo. Verifique que el formato sea correcto y no esté dañado.';
                if (str_contains($th->getMessage(), 'Allowed memory size') || str_contains(strtolower($th->getMessage()), 'out of memory')) {
                    $errorMessage = 'El archivo Excel es demasiado grande o complejo y excede el límite de memoria del servidor. Intente con un archivo más pequeño o contacte al administrador.';
                } elseif ($th instanceof \PhpOffice\PhpSpreadsheet\Reader\Exception) {
                    $errorMessage = 'El archivo no es un formato Excel válido o está corrupto. Por favor, verifique el archivo.';
                } elseif ($th instanceof \PhpOffice\PhpSpreadsheet\Exception) {
                     $errorMessage = 'Error en el procesamiento del archivo Excel. Asegúrese de que el archivo no esté protegido o dañado.';
                }
                $errors[] = $errorMessage;
            }
        }

        return Inertia::render('CentrosEducativos/Import', [
            'preview' => $preview,
            'headers' => $headers,
            'errors' => $errors,
            'totalRows' => $totalRows,
        ]);
    }

    /**
     * Procesa el archivo Excel y guarda los centros educativos
     */
    public function importStore(Request $request): JsonResponse
    {
        ini_set('memory_limit', '512M');
        set_time_limit(300);

        $request->validate([
            'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
        ]);

        $uploadedFile = $request->file('archivo_excel');
        $fileSize = $uploadedFile->getSize();

        if ($fileSize > self::MAX_IMPORT_FILE_SIZE) {
            return response()->json([
                'importados' => 0,
                'errores' => ['El archivo es demasiado grande para la importación (' . round($fileSize / (1024 * 1024), 2) . 'MB). El tamaño máximo permitido es ' . round(self::MAX_IMPORT_FILE_SIZE / (1024 * 1024), 2) . 'MB.']
            ], 413);
        }

        $path = $uploadedFile->getPathname();
        $resultado = app(CentroEducativoImportService::class)->import($path);

        return response()->json($resultado->toArray());
    }
}

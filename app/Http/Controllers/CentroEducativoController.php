<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use App\Services\CentroEducativoImportService;
use App\Models\CentroEducativo;
use App\Transformers\CentroEducativoTransformer; // Added import for Transformer
use PhpOffice\PhpSpreadsheet\IOFactory;

class CentroEducativoController extends Controller
{
    private const MAX_PREVIEW_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
    private const MAX_IMPORT_FILE_SIZE = 50 * 1024 * 1024;  // 50 MB

    /**
     * Muestra el formulario de importación y maneja la previsualización del archivo.
     */
    public function create(Request $request)
    {
        ini_set('memory_limit', '512M'); // Aumentar el límite de memoria para PhpSpreadsheet
        set_time_limit(300); // Aumentar el límite de tiempo a 5 minutos

        $preview = null;
        $headers = null;
        $errors = [];
        $totalRows = 0;

        if ($request->hasFile('archivo_excel')) {
            $request->validate([
                'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048', // Max 2MB for browser validation
            ]);

            $uploadedFile = $request->file('archivo_excel');
            $fileSize = $uploadedFile->getSize();

            if ($fileSize > self::MAX_PREVIEW_FILE_SIZE) {
                $errors[] = 'El archivo es demasiado grande para la previsualización (' . round($fileSize / (1024 * 1024), 2) . 'MB). El tamaño máximo permitido es ' . round(self::MAX_PREVIEW_FILE_SIZE / (1024 * 1024), 2) . 'MB.';
                return Inertia::render('CentroEducativo/Import', [
                    'preview' => $preview,
                    'headers' => $headers,
                    'errors' => $errors,
                    'centros' => CentroEducativo::all(),
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
                
                // Obtener encabezados de la primera fila
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

                // Validar encabezados requeridos
                $requeridos = ['codigo', 'nombre', 'departamento', 'distrito', 'sector', 'zona', 'direccion', 'internacional'];
                $faltantes = array_diff($requeridos, array_keys($columnIndexes));

                if ($faltantes) {
                    $errors[] = 'Faltan columnas requeridas: ' . implode(', ', $faltantes);
                } else {
    
                    // Transformar las primeras 10 filas para previsualización
                    $preview = [];
                    $rowIterator = $sheet->getRowIterator(2, 11); // Del renglón 2 al 11 (10 filas de datos)
                    foreach ($rowIterator as $row) {
                        $cellIterator = $row->getCellIterator();
                        $cellIterator->setIterateOnlyExistingCells(FALSE); 
                        $rowData = [];
                        foreach ($cellIterator as $cell) {
                            $rowData[] = $cell->getValue();
                        }
                        if (count(array_filter($rowData)) == 0) continue; // Skip empty rows
                        
                        $preview[] = $transformer->transformRow($rowData, $columnIndexes);
                    }
                }
            } catch (\Throwable $th) {
                // Log the detailed error for developers
                logger()->error("Error processing excel file for preview: " . $th->getMessage());
                
                $errorMessage = 'Ocurrió un error inesperado al leer el archivo. Verifique que el formato sea correcto y no esté dañado.';

                // Check for memory-related errors
                if (str_contains($th->getMessage(), 'Allowed memory size') || str_contains(strtolower($th->getMessage()), 'out of memory')) {
                    $errorMessage = 'El archivo Excel es demasiado grande o complejo y excede el límite de memoria del servidor. Intente con un archivo más pequeño o contacte al administrador.';
                } 
                // Check for file format/corruption errors from PhpSpreadsheet
                elseif ($th instanceof \PhpOffice\PhpSpreadsheet\Reader\Exception) {
                    $errorMessage = 'El archivo no es un formato Excel válido o está corrupto. Por favor, verifique el archivo.';
                }
                // Check for generic PhpSpreadsheet errors
                elseif ($th instanceof \PhpOffice\PhpSpreadsheet\Exception) {
                     $errorMessage = 'Error en el procesamiento del archivo Excel. Asegúrese de que el archivo no esté protegido o dañado.';
                }

                $errors[] = $errorMessage;
            }
        }

        $centros = CentroEducativo::all();

        return Inertia::render('CentroEducativo/Import', [
            'preview' => $preview,
            'headers' => $headers,
            'errors' => $errors,
            'centros' => $centros,
            'totalRows' => $totalRows,
        ]);
    }

    /**
     * Procesa el archivo Excel y guarda los centros educativos
     */
    public function store(Request $request): JsonResponse
    {
        ini_set('memory_limit', '512M'); // Aumentar el límite de memoria para PhpSpreadsheet
        set_time_limit(300); //5 minutos -> Implementar dispatch

        $request->validate([
            'archivo_excel' => 'required|file|mimes:xls,xlsx|max:2048',
        ]);

        $uploadedFile = $request->file('archivo_excel');
        $fileSize = $uploadedFile->getSize();

        if ($fileSize > self::MAX_IMPORT_FILE_SIZE) {
            return response()->json([
                'importados' => 0,
                'errores' => ['El archivo es demasiado grande para la importación (' . round($fileSize / (1024 * 1024), 2) . 'MB). El tamaño máximo permitido es ' . round(self::MAX_IMPORT_FILE_SIZE / (1024 * 1024), 2) . 'MB.']
            ], 413); // 413 Payload Too Large
        }

        $path = $uploadedFile->getPathname();
        $resultado = app(CentroEducativoImportService::class)->import($path);

        return response()->json($resultado->toArray());
    }
}

<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Models\ClinicalRecord\ConsentForm;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ConsentFormController extends Controller
{
    /**
     * Muestra el archivo del consentimiento informado en el navegador (inline).
     */
    public function file(ConsentForm $consent_form)
    {
        $this->authorize('view', $consent_form);

        if (!$consent_form->file_path || !Storage::disk('private')->exists($consent_form->file_path)) {
            abort(404, 'Archivo de consentimiento no encontrado.');
        }

        $path = $consent_form->file_path;
        $mime = Storage::disk('private')->mimeType($path) ?: 'application/octet-stream';
        $filename = basename($path);

        // Stream inline so the browser opens it in a new tab
        $stream = Storage::disk('private')->readStream($path);
        if ($stream === false) {
            abort(500, 'No fue posible leer el archivo del consentimiento.');
        }

        return response()->stream(function () use ($stream) {
            fpassthru($stream);
        }, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }
}

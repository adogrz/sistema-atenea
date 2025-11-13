<?php

namespace App\Http\Controllers\ClinicalRecord\Concerns;

use App\Models\ClinicalRecord\ConsentForm;
use App\Services\ClinicalRecord\ConsentFormCreator;
use Exception;
use Illuminate\Http\Request;

trait HandlesConsentForms
{
    /**
     * Procesa el consentimiento informado si es necesario.
     *
     * Retorna el ID del consentimiento existente o crea uno nuevo.
     *
     * @param Request $request
     * @param string $studentNie
     * @param bool $isMinor
     * @param string $type Tipo de consentimiento ('medical' o 'psychological')
     * @return int|null
     * @throws Exception
     */
    protected function processConsentForm(Request $request, string $studentNie, bool $isMinor, string $type = 'medical'): ?int
    {
        // Si no es menor, no se requiere consentimiento
        if (!$isMinor) {
            return null;
        }

        // Caso 1: Usar consentimiento existente
        if ($request->has('consent_form_id') && $request->input('consent_form_id')) {
            $consentFormId = $request->input('consent_form_id');

            // Verificar que el consentimiento existe y pertenece al estudiante
            $consentForm = ConsentForm::where('id', $consentFormId)
                ->where('student_nie', $studentNie)
                ->where('type', $type)
                ->firstOrFail();

            return $consentForm->id;
        }

        // Caso 2: Crear nuevo consentimiento
        // IMPORTANTE: Solo crear si hay datos de consent Y no hay consent_form_id
        if ($request->has('consent') && is_array($request->input('consent')) && !$request->has('consent_form_id')) {
            return $this->createNewConsentForm($request, $studentNie);
        }

        // Si es menor y no hay consentimiento, lanzar excepción
        // Esto normalmente debería ser capturado por la validación del FormRequest
        throw new Exception('Se requiere un consentimiento informado para estudiantes menores de edad.');
    }

    /**
     * Crea un nuevo consentimiento informado.
     *
     * @param Request $request
     * @param string $studentNie
     * @return int
     * @throws Exception
     */
    protected function createNewConsentForm(Request $request, string $studentNie): int
    {
        $consentData = $request->input('consent');
        $consentData['student_nie'] = $studentNie;

        // Debug: Verificar si el archivo está presente
        if ($request->hasFile('consent.file')) {
            \Log::info('Archivo de consentimiento recibido', [
                'original_name' => $request->file('consent.file')->getClientOriginalName(),
                'size' => $request->file('consent.file')->getSize(),
                'mime' => $request->file('consent.file')->getMimeType(),
            ]);
            $consentData['file'] = $request->file('consent.file');
        } else {
            \Log::error('No se recibió archivo de consentimiento', [
                'has_input' => $request->has('consent'),
                'consent_keys' => array_keys($consentData),
            ]);
            throw new Exception('No se recibió el archivo del consentimiento informado.');
        }

        // Inyectar el servicio si no está disponible
        if (!property_exists($this, 'consentFormCreator')) {
            throw new Exception('ConsentFormCreator service no está disponible en este controlador.');
        }

        $consentForm = $this->consentFormCreator->create(
            $consentData,
            $request->user()->id
        );

        \Log::info('Consentimiento creado exitosamente', [
            'id' => $consentForm->id,
            'file_path' => $consentForm->file_path,
        ]);

        return $consentForm->id;
    }
}


<?php

namespace App\Services\ClinicalRecord;

use App\Models\ClinicalRecord\ConsentForm;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ConsentFormCreator
{
    /**
     * Crea un nuevo consentimiento informado con el archivo adjunto.
     *
     * @param array $data
     * @param int $professionalId
     * @return ConsentForm
     * @throws Exception
     */
    public function create(array $data, int $professionalId): ConsentForm
    {
        // Validar que los datos requeridos estén presentes
        $this->validateRequiredData($data);

        // Procesar el archivo si existe
        $filePath = null;
        if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
            $filePath = $this->storeConsentFile($data['file'], $data['student_nie'], $data['type']);
        }

        try {
            // Crear el consentimiento
            $consentForm = ConsentForm::create([
                'student_nie' => $data['student_nie'],
                'responsible_id' => $data['responsible_id'],
                'professional_id' => $professionalId,
                'type' => $data['type'],
                'granted_at' => $data['granted_at'],
                'file_path' => $filePath,
                'observations' => $data['observations'] ?? null,
            ]);

            return $consentForm;
        } catch (Exception $e) {
            // Si falla la creación del consentimiento, eliminar el archivo subido
            if ($filePath) {
                Storage::delete($filePath);
            }

            throw new Exception("Error al crear el consentimiento: {$e->getMessage()}");
        }
    }

    /**
     * Valida que los datos requeridos estén presentes.
     *
     * @param array $data
     * @throws Exception
     */
    private function validateRequiredData(array $data): void
    {
        $requiredFields = ['student_nie', 'responsible_id', 'type', 'granted_at'];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("El campo {$field} es requerido para crear un consentimiento.");
            }
        }

        // Validar tipo de consentimiento
        if (!in_array($data['type'], ['medical', 'psychological'])) {
            throw new Exception("El tipo de consentimiento debe ser 'medical' o 'psychological'.");
        }

        // Validar que el archivo exista si se proporcionó
        if (isset($data['file']) && !($data['file'] instanceof UploadedFile)) {
            throw new Exception("El archivo del consentimiento debe ser un archivo válido.");
        }
    }

    /**
     * Almacena el archivo del consentimiento en el storage.
     *
     * @param UploadedFile $file
     * @param string $studentNie
     * @param string $type
     * @return string
     */
    private function storeConsentFile(UploadedFile $file, string $studentNie, string $type): string
    {
        // Generar nombre único para el archivo
        $fileName = sprintf(
            '%s_%s_%s.%s',
            $studentNie,
            $type,
            now()->format('YmdHis'),
            $file->getClientOriginalExtension()
        );

        // Almacenar en la carpeta correspondiente
        $path = $file->storeAs(
            "consent-forms/{$type}/{$studentNie}",
            $fileName,
            'private'
        );

        return $path;
    }

    /**
     * Elimina el archivo de consentimiento del storage.
     *
     * @param string $filePath
     * @return bool
     */
    public function deleteFile(string $filePath): bool
    {
        if (Storage::exists($filePath)) {
            return Storage::delete($filePath);
        }

        return false;
    }
}


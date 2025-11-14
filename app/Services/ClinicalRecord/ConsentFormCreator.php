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
            \Log::info('Archivo de consentimiento guardado', ['path' => $filePath]);
        } else {
            \Log::warning('No se recibió archivo para el consentimiento', [
                'has_file_key' => isset($data['file']),
                'file_type' => isset($data['file']) ? get_class($data['file']) : 'null',
            ]);
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

        // Validar que el archivo exista si se proporcionó (no es obligatorio temporalmente)
        if (isset($data['file']) && !($data['file'] instanceof UploadedFile)) {
            \Log::warning('Archivo de consentimiento inválido', [
                'type' => gettype($data['file']),
                'class' => is_object($data['file']) ? get_class($data['file']) : 'not an object',
            ]);
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

        // Almacenar en la carpeta correspondiente usando el disco 'private'
        // La ruta completa será: storage/app/private/consent-forms/{type}/{studentNie}/{fileName}
        $path = $file->storeAs(
            "consent-forms/{$type}/{$studentNie}",
            $fileName,
            'private'
        );

        if (!$path) {
            throw new Exception("Error al guardar el archivo del consentimiento.");
        }

        // Verificar que el archivo realmente se guardó
        if (!Storage::disk('private')->exists($path)) {
            throw new Exception("El archivo del consentimiento no se guardó correctamente.");
        }

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


<?php

namespace App\Services\ClinicalRecord;

use App\Models\ClinicalRecord\ConsentForm;
use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\ClinicalRecord\MedicalRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MedicalRecordCreator
{
    /**
     * Crea un expediente médico con su consulta inicial y consentimiento (si aplica).
     *
     * @param array $validatedData Datos validados del request
     * @param int $doctorId ID del doctor que crea el expediente
     * @return MedicalRecord
     * @throws \Exception
     */
    public function create(array $validatedData, int $doctorId): MedicalRecord
    {
        DB::beginTransaction();

        $storedFilePath = null; // Variable para trackear el archivo guardado

        try {
            // 1. Crear el expediente médico
            $medicalRecord = $this->createMedicalRecord($validatedData, $doctorId);

            // 2. Crear el consentimiento informado si es necesario
            $consentFormId = null;
            if ($this->needsConsent($validatedData)) {
                $consentResult = $this->handleConsent($validatedData, $doctorId);
                $consentFormId = $consentResult['id'];
                $storedFilePath = $consentResult['file_path']; // Guardar ruta del archivo
            }

            // 3. Crear la consulta médica inicial
            $this->createMedicalConsultation($medicalRecord, $validatedData, $doctorId, $consentFormId);

            DB::commit();

            // Cargar relaciones para la respuesta
            $medicalRecord->load([
                'student',
                'creator',
                'medicalConsultations.doctor',
                'medicalConsultations.consentForm'
            ]);

            return $medicalRecord;

        } catch (\Exception $e) {
            DB::rollBack();

            // Eliminar archivo subido si existe y se guardó exitosamente
            if ($storedFilePath && Storage::exists($storedFilePath)) {
                Storage::delete($storedFilePath);
            }

            throw $e;
        }
    }

    /**
     * Crea el expediente médico.
     *
     * @param array $data
     * @param int $doctorId
     * @return MedicalRecord
     */
    private function createMedicalRecord(array $data, int $doctorId): MedicalRecord
    {
        return MedicalRecord::create([
            'student_nie' => $data['student_nie'],
            'general_background' => $data['general_background'] ?? null,
            'created_by' => $doctorId,
        ]);
    }

    /**
     * Verifica si se necesita crear un consentimiento.
     *
     * @param array $data
     * @return bool
     */
    private function needsConsent(array $data): bool
    {
        return $data['is_minor'] && (
            isset($data['consent_form_id']) ||
            isset($data['consent'])
        );
    }

    /**
     * Maneja la creación o asociación del consentimiento.
     *
     * @param array $data
     * @param int $professionalId
     * @return array ['id' => int, 'file_path' => string|null]
     */
    private function handleConsent(array $data, int $professionalId): array
    {
        // Si se proporciona un ID de consentimiento existente, usarlo
        if (isset($data['consent_form_id'])) {
            return [
                'id' => $data['consent_form_id'],
                'file_path' => null, // No se creó archivo nuevo
            ];
        }

        // Si se proporcionan datos para crear un nuevo consentimiento
        if (isset($data['consent'])) {
            return $this->createConsentForm($data, $professionalId);
        }

        return [
            'id' => null,
            'file_path' => null,
        ];
    }

    /**
     * Crea un nuevo formulario de consentimiento.
     *
     * @param array $data
     * @param int $professionalId
     * @return array ['id' => int, 'file_path' => string|null]
     */
    private function createConsentForm(array $data, int $professionalId): array
    {
        $consentData = $data['consent'];

        // Guardar el archivo
        $filePath = null;
        if (isset($consentData['file']) && $consentData['file']) {
            $filePath = $consentData['file']->store('consent_forms', 'public');
        }

        $consentForm = ConsentForm::create([
            'student_nie' => $data['student_nie'],
            'responsible_id' => $consentData['responsible_id'],
            'professional_id' => $professionalId,
            'type' => $consentData['type'],
            'granted_at' => $consentData['granted_at'],
            'file_path' => $filePath,
            'observations' => $consentData['observations'] ?? null,
        ]);

        return [
            'id' => $consentForm->id,
            'file_path' => $filePath,
        ];
    }

    /**
     * Crea la consulta médica inicial.
     *
     * @param MedicalRecord $medicalRecord
     * @param array $data
     * @param int $doctorId
     * @param int|null $consentFormId
     * @return MedicalConsultation
     */
    private function createMedicalConsultation(
        MedicalRecord $medicalRecord,
        array $data,
        int $doctorId,
        ?int $consentFormId
    ): MedicalConsultation {
        $consultationData = $data['consultation'];

        return MedicalConsultation::create([
            'medical_record_id' => $medicalRecord->id,
            'doctor_id' => $doctorId,
            'consent_form_id' => $consentFormId,
            'consultation_date' => $consultationData['consultation_date'],
            'diagnosis' => $consultationData['diagnosis'],
            'treatment' => $consultationData['treatment'] ?? null,
            'observations' => $consultationData['observations'] ?? null,
        ]);
    }
}

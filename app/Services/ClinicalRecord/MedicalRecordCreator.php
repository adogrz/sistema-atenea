<?php

namespace App\Services\ClinicalRecord;

use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\ClinicalRecord\MedicalRecord;
use Illuminate\Support\Facades\DB;

class MedicalRecordCreator
{
    /**
     * Crea un expediente médico con su consulta inicial.
     * El consentimiento debe ser procesado previamente en el controlador.
     *
     * @param array $validatedData Datos validados del request
     * @param int $doctorId ID del doctor que crea el expediente
     * @return MedicalRecord
     * @throws \Exception
     */
    public function create(array $validatedData, int $doctorId): MedicalRecord
    {
        DB::beginTransaction();

        try {
            // 1. Crear el expediente médico
            $medicalRecord = $this->createMedicalRecord($validatedData, $doctorId);

            // 2. Crear la consulta médica inicial
            $this->createMedicalConsultation(
                $medicalRecord,
                $validatedData,
                $doctorId,
                $validatedData['consent_form_id'] ?? null
            );

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

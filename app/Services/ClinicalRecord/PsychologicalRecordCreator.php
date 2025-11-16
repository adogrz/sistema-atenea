<?php

namespace App\Services\ClinicalRecord;

use App\Models\ClinicalRecord\PsychologicalRecord;
use App\Models\ClinicalRecord\PsychologicalSession;
use Illuminate\Support\Facades\DB;

class PsychologicalRecordCreator
{
    /**
     * Crea un expediente psicológico con su sesión inicial.
     * El consentimiento debe ser procesado previamente en el controlador.
     *
     * @param array $validatedData Datos validados del request
     * @param int $psychologistId ID del psicólogo que crea el expediente
     * @return PsychologicalRecord
     * @throws \Exception
     */
    public function create(array $validatedData, int $psychologistId): PsychologicalRecord
    {
        DB::beginTransaction();

        try {
            // 1. Crear el expediente psicológico
            $psychologicalRecord = $this->createPsychologicalRecord($validatedData, $psychologistId);

            // 2. Crear la sesión psicológica inicial
            $this->createPsychologicalSession(
                $psychologicalRecord,
                $validatedData,
                $psychologistId,
                $validatedData['consent_form_id'] ?? null
            );

            DB::commit();

            // Cargar relaciones para la respuesta
            $psychologicalRecord->load([
                'student',
                'creator',
                'psychologicalSessions.psychologist',
                'psychologicalSessions.consentForm'
            ]);

            return $psychologicalRecord;

        } catch (\Exception $e) {
            DB::rollBack();

            throw $e;
        }
    }

    /**
     * Crea el expediente psicológico.
     *
     * @param array $data
     * @param int $psychologistId
     * @return PsychologicalRecord
     */
    private function createPsychologicalRecord(array $data, int $psychologistId): PsychologicalRecord
    {
        return PsychologicalRecord::create([
            'student_nie' => $data['student_nie'],
            'initial_assessment' => $data['initial_assessment'] ?? null,
            'created_by' => $psychologistId,
        ]);
    }

    /**
     * Crea la sesión psicológica inicial.
     *
     * @param PsychologicalRecord $psychologicalRecord
     * @param array $data
     * @param int $psychologistId
     * @param int|null $consentFormId
     * @return PsychologicalSession
     */
    private function createPsychologicalSession(
        PsychologicalRecord $psychologicalRecord,
        array $data,
        int $psychologistId,
        ?int $consentFormId
    ): PsychologicalSession {
        $sessionData = $data['session'];

        return PsychologicalSession::create([
            'psychological_record_id' => $psychologicalRecord->id,
            'psychologist_id' => $psychologistId,
            'consent_form_id' => $consentFormId,
            'session_date' => $sessionData['session_date'],
            'session_content' => $sessionData['session_content'],
            'test_results' => $sessionData['test_results'] ?? null,
            'observations' => $sessionData['observations'] ?? null,
        ]);
    }
}

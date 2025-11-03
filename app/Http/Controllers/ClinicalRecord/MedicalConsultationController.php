<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesConsentForms;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesStudentData;
use App\Http\Requests\ClinicalRecord\StoreMedicalConsultationRequest;
use App\Http\Requests\ClinicalRecord\UpdateMedicalConsultationRequest;
use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\ClinicalRecord\MedicalRecord;
use App\Services\ClinicalRecord\ConsentFormCreator;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MedicalConsultationController extends Controller
{
    use HandlesStudentData, HandlesConsentForms;

    public function __construct(
        private ConsentFormCreator $consentFormCreator
    ) {}

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, MedicalRecord $medicalRecord)
    {
        $this->authorize('create', MedicalConsultation::class);
        $this->authorize('view', $medicalRecord);

        // Cargar relaciones necesarias del expediente
        $medicalRecord->load('student');

        // Preparar datos del estudiante usando el trait
        $studentData = $this->prepareStudentData($medicalRecord->student_nie);

        return Inertia::render('clinical-records/medical-consultation/create-medical-consultation', [
            'medical_record' => [
                'id' => $medicalRecord->id,
                'student_nie' => $medicalRecord->student_nie,
                'general_background' => $medicalRecord->general_background,
                'created_at' => $medicalRecord->created_at->format('Y-m-d'),
            ],
            'student' => $studentData['student'],
            'is_minor' => $studentData['is_minor'],
            'responsables' => $studentData['responsables'],
            'existing_consents' => $studentData['existing_consents'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedicalConsultationRequest $request, MedicalRecord $medicalRecord)
    {
        $this->authorize('create', MedicalConsultation::class);
        $this->authorize('view', $medicalRecord);

        DB::beginTransaction();

        try {
            // Determinar si el estudiante es menor y procesar consentimiento
            $isMinor = $request->input('is_minor', false);
            $consentFormId = $this->processConsentForm($request, $medicalRecord->student_nie, $isMinor);

            // Crear la consulta médica
            $medicalConsultation = MedicalConsultation::create([
                'medical_record_id' => $medicalRecord->id,
                'doctor_id' => $request->user()->id,
                'consent_form_id' => $consentFormId,
                'consultation_date' => $request->input('consultation_date'),
                'diagnosis' => $request->input('diagnosis'),
                'treatment' => $request->input('treatment'),
                'observations' => $request->input('observations'),
            ]);

            DB::commit();

            return redirect()
                ->route('clinical-records.medical-records.show', $medicalRecord)
                ->with('success', 'Consulta médica creada exitosamente.');

        } catch (Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Ocurrió un error al crear la consulta médica: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, MedicalRecord $medicalRecord, MedicalConsultation $consultation)
    {
        // Verificar permisos
        $this->authorize('view', $consultation);
        $this->authorize('view', $medicalRecord);

        // Verificar que la consulta pertenezca al expediente
        if ($consultation->medical_record_id !== $medicalRecord->id) {
            abort(404, 'La consulta no pertenece a este expediente médico.');
        }

        // Cargar relaciones necesarias
        $consultation->load([
            'doctor',
            'consentForm.responsible',
        ]);

        $medicalRecord->load('student');

        return Inertia::render('clinical-records/medical-consultation/show-medical-consultation', [
            'consultation' => [
                'id' => $consultation->id,
                'medical_record_id' => $consultation->medical_record_id,
                'doctor_id' => $consultation->doctor_id,
                'consent_form_id' => $consultation->consent_form_id,
                'consultation_date' => $consultation->consultation_date->format('d/m/Y'),
                'diagnosis' => $consultation->diagnosis,
                'treatment' => $consultation->treatment,
                'observations' => $consultation->observations,
                'change_justification' => $consultation->change_justification,
                'created_at' => $consultation->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $consultation->updated_at->format('Y-m-d H:i:s'),
                'doctor' => $consultation->doctor,
                'consent_form' => $consultation->consentForm ? [
                    'id' => $consultation->consentForm->id,
                    'student_nie' => $consultation->consentForm->student_nie,
                    'responsible_id' => $consultation->consentForm->responsible_id,
                    'type' => $consultation->consentForm->type,
                    'granted_at' => $consultation->consentForm->granted_at->format('d/m/Y'),
                    'file_path' => $consultation->consentForm->file_path,
                    'observations' => $consultation->consentForm->observations,
                    'responsible' => $consultation->consentForm->responsible,
                ] : null,
            ],
            'medical_record' => [
                'id' => $medicalRecord->id,
                'student_nie' => $medicalRecord->student_nie,
                'general_background' => $medicalRecord->general_background,
                'created_at' => $medicalRecord->created_at->format('Y-m-d'),
            ],
            'student' => $medicalRecord->student,
            'permissions' => [
                'canUpdate' => $request->user()->can('update', $consultation),
                'canDelete' => $request->user()->can('delete', $consultation),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, MedicalRecord $medicalRecord, MedicalConsultation $consultation)
    {
        // Verificar permisos
        $this->authorize('update', $consultation);
        $this->authorize('view', $medicalRecord);

        // Verificar que la consulta pertenezca al expediente
        if ($consultation->medical_record_id !== $medicalRecord->id) {
            abort(404, 'La consulta no pertenece a este expediente médico.');
        }

        // Cargar relaciones necesarias
        $consultation->load([
            'doctor',
            'consentForm.responsible',
        ]);

        $medicalRecord->load('student');

        // Preparar datos del estudiante usando el trait
        $studentData = $this->prepareStudentData($medicalRecord->student_nie);

        return Inertia::render('clinical-records/medical-consultation/edit-medical-consultation', [
            'consultation' => [
                'id' => $consultation->id,
                'medical_record_id' => $consultation->medical_record_id,
                'doctor_id' => $consultation->doctor_id,
                'doctor_name' => $consultation->doctor->name,
                'consent_form_id' => $consultation->consent_form_id,
                'consultation_date' => $consultation->consultation_date->format('Y-m-d\TH:i'),
                'diagnosis' => $consultation->diagnosis,
                'treatment' => $consultation->treatment,
                'observations' => $consultation->observations,
                'created_at' => $consultation->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $consultation->updated_at->format('Y-m-d H:i:s'),
            ],
            'medical_record' => [
                'id' => $medicalRecord->id,
                'student_nie' => $medicalRecord->student_nie,
                'created_at' => $medicalRecord->created_at->format('Y-m-d'),
            ],
            'student' => $studentData['student'],
            'permissions' => [
                'canUpdate' => $request->user()->can('update', $consultation),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicalConsultationRequest $request, MedicalRecord $medicalRecord, MedicalConsultation $consultation)
    {
        // Verificar permisos
        $this->authorize('update', $consultation);
        $this->authorize('view', $medicalRecord);

        // Verificar que la consulta pertenezca al expediente
        if ($consultation->medical_record_id !== $medicalRecord->id) {
            abort(404, 'La consulta no pertenece a este expediente médico.');
        }

        DB::beginTransaction();

        try {
            // Actualizar la consulta médica con los datos validados
            $consultation->update([
                'consultation_date' => $request->input('consultation_date'),
                'diagnosis' => $request->input('diagnosis'),
                'treatment' => $request->input('treatment'),
                'observations' => $request->input('observations'),
                'change_justification' => $request->input('change_justification'),
            ]);

            DB::commit();

            return redirect()
                ->route('clinical-records.medical-records.show', $medicalRecord->id)
                ->with('success', 'Consulta médica actualizada exitosamente.');

        } catch (Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Error al actualizar la consulta médica: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, MedicalRecord $medicalRecord, MedicalConsultation $consultation)
    {
        // Verificar permisos
        $this->authorize('delete', $consultation);
        $this->authorize('view', $medicalRecord);

        // Verificar que la consulta pertenezca al expediente
        if ($consultation->medical_record_id !== $medicalRecord->id) {
            abort(404, 'La consulta no pertenece a este expediente médico.');
        }

        // Validar que se proporcione una justificación
        $validated = $request->validate([
            'justification' => [
                'required',
                'string',
                'min:10',
                'max:1000',
            ],
        ], [
            'justification.required' => 'La justificación es requerida para eliminar una consulta médica.',
            'justification.min' => 'La justificación debe tener al menos 10 caracteres.',
            'justification.max' => 'La justificación no puede superar los 1000 caracteres.',
        ]);

        try {
            // Guardar la justificación antes de eliminar
            $consultation->change_justification = $validated['justification'];
            $consultation->save();

            // Soft delete de la consulta
            $consultation->delete();

            // No redirigir, dejar que Inertia maneje la respuesta
            // El frontend mostrará el toast con el botón de deshacer
            return back();

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al eliminar la consulta médica: ' . $e->getMessage()]);
        }
    }

    /**
     * Restore a soft-deleted consultation.
     * Solo accesible para consultas recientemente eliminadas (dentro del período de "deshacer").
     */
    public function restore(Request $request, MedicalRecord $medicalRecord, $consultationId)
    {
        // Buscar la consulta eliminada (withTrashed para incluir soft deleted)
        $consultation = MedicalConsultation::withTrashed()->findOrFail($consultationId);

        // Verificar permisos
        $this->authorize('restore', $consultation);
        $this->authorize('view', $medicalRecord);

        // Verificar que la consulta pertenezca al expediente
        if ($consultation->medical_record_id !== $medicalRecord->id) {
            abort(404, 'La consulta no pertenece a este expediente médico.');
        }

        // Verificar que la consulta esté eliminada
        if (!$consultation->trashed()) {
            return redirect()
                ->route('clinical-records.medical-records.show', $medicalRecord)
                ->withErrors(['error' => 'La consulta no está eliminada.']);
        }

        try {
            // Restaurar la consulta
            $consultation->restore();

            // Limpiar la justificación de eliminación ya que se revirtió la acción
            $consultation->change_justification = null;
            $consultation->save();

            // No redirigir, dejar que Inertia maneje la respuesta
            return back();

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al restaurar la consulta médica: ' . $e->getMessage()]);
        }
    }
}

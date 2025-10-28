<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesConsentForms;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesStudentData;
use App\Http\Requests\ClinicalRecord\StoreMedicalConsultationRequest;
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
            'consultation' => $consultation,
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
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

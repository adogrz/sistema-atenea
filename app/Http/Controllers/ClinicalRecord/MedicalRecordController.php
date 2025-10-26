<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicalRecord\StoreMedicalRecordRequest;
use App\Models\ClinicalRecord\ConsentForm;
use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\ClinicalRecord\MedicalRecord;
use App\Models\Estudiante;
use App\Services\ClinicalRecord\MedicalRecordCreator;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicalRecordController extends Controller
{
    public function __construct(
        private MedicalRecordCreator $medicalRecordCreator
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', MedicalRecord::class);

        // TODO: Implementar listado de expedientes médicos
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->authorize('create', MedicalRecord::class);

        $studentNie = $request->input('student_nie', '');

        if (!$studentNie) {
            return redirect()
                ->route('clinical-records.assignments.index')
                ->withErrors(['error' => 'NIE del estudiante no proporcionado']);
        }

        // Verificar si ya existe un expediente médico para este estudiante
        $existingRecord = MedicalRecord::where('student_nie', $studentNie)->first();

        if ($existingRecord) {
            // Si ya existe, redirigir al show
            return redirect()->route('clinical-records.medical-records.show', $existingRecord);
        }

        $student = Estudiante::with([
            'responsable',
            'responsables',
            'consentForms' => function ($query) {
                $query->where('type', 'medical')
                    ->orderBy('granted_at', 'desc');
            }
        ])
            ->where('nie', $studentNie)
            ->first();

        if (!$student) {
            return redirect()
                ->route('clinical-records.assignments.index')
                ->withErrors(['error' => 'Estudiante no encontrado']);
        }

        $responsables = [];
        $existingConsents = [];

        // Obtener responsables asociados al estudiante (soporta múltiples)
        $responsables = $student->responsables && $student->responsables->count() > 0
            ? $student->responsables
            : ($student->responsable ? collect([$student->responsable]) : collect());

        // Normalizar responsables a estructura liviana para el frontend
        $responsablesData = $responsables->map(function ($r) {
            return [
                'id' => $r->id,
                'dui' => $r->dui,
                'nombres_responsable' => $r->nombres_responsable,
                'apellidos_responsable' => $r->apellidos_responsable,
            ];
        })->values();

        // Obtener consentimientos médicos existentes
        $existingConsents = $student->consentForms->map(function ($consent) {
            return [
                'id' => $consent->id,
                'granted_at' => $consent->granted_at->format('Y-m-d'),
                'responsible_name' => $consent->responsible
                    ? "{$consent->responsible->nombres_responsable} {$consent->responsible->apellidos_responsable}"
                    : 'N/A',
            ];
        });

        return Inertia::render('clinical-records/medical-record/create-medical-record', [
            'student_nie' => $studentNie,
            'student' => [
                'nie' => $student->nie,
                'codigo' => $student->codigo,
                'primer_nombre' => $student->primer_nombre,
                'segundo_nombre' => $student->segundo_nombre,
                'primer_apellido' => $student->primer_apellido,
                'segundo_apellido' => $student->segundo_apellido,
                'fecha_nacimiento' => $student->fecha_nacimiento->format('Y-m-d'),
                'sexo' => $student->sexo,
                'email' => $student->email,
            ],
            'responsables' => $responsablesData,
            'existing_consents' => $existingConsents,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedicalRecordRequest $request)
    {
        // Verificar permisos adicionales
        $this->authorize('create', MedicalConsultation::class);

        // Si se incluyen datos de consentimiento, verificar permiso
        if ($request->has('consent') || $request->has('consent_form_id')) {
            $this->authorize('create', ConsentForm::class);
        }

        // Calcular edad del estudiante y agregar al request
        $student = Estudiante::where('nie', $request->student_nie)->firstOrFail();
        $isMinor = $student->fecha_nacimiento->age < 18;
        $request->merge(['is_minor' => $isMinor]);

        try {
            // Crear el expediente médico usando el servicio
            $medicalRecord = $this->medicalRecordCreator->create(
                $request->validated(),
                $request->user()->id
            );

            return redirect()
                ->route('clinical-records.medical-records.show', $medicalRecord)
                ->with('success', 'Expediente médico creado exitosamente.');

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Ocurrió un error al crear el expediente médico: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, MedicalRecord $medicalRecord)
    {
        $this->authorize('view', $medicalRecord);

        $medicalRecord->load([
            'student',
            'creator',
            'medicalConsultations.doctor',
            'medicalConsultations.consentForm.responsible'
        ]);

        return Inertia::render('clinical-records/medical-record/show-medical-record', [
            'medicalRecord' => $medicalRecord,
            'permissions' => [
                'canUpdate' => $request->user()->can('update', $medicalRecord),
                'canDelete' => $request->user()->can('delete', $medicalRecord),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MedicalRecord $medicalRecord)
    {
        $this->authorize('update', $medicalRecord);

        // TODO: Implementar vista de edición de expediente médico
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        $this->authorize('update', $medicalRecord);

        // TODO: Implementar actualización de expediente médico
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MedicalRecord $medicalRecord)
    {
        $this->authorize('delete', $medicalRecord);

        try {
            $medicalRecord->delete();

            return redirect()
                ->route('clinical-records.medical-records.index')
                ->with('success', 'Expediente médico eliminado exitosamente.');

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al eliminar el expediente médico: ' . $e->getMessage()]);
        }
    }
}

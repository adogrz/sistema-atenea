<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicalRecord\StoreMedicalRecordRequest;
use App\Http\Requests\ClinicalRecord\UpdateMedicalRecordRequest;
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
    public function index(Request $request)
    {
        $this->authorize('viewAny', MedicalRecord::class);

        $user = $request->user();

        // Si el usuario tiene permiso para ver todos los expedientes (jefe)
        if ($user->can('medical-records:view-all')) {
            $query = MedicalRecord::with([
                'student.user',
                'creator',
                'medicalConsultations'
            ]);

            // Filtrar por sede si el usuario tiene sede asignada
            if ($user->sede_name) {
                $query->whereHas('student.user', function ($q) use ($user) {
                    $q->where('sede_name', $user->sede_name);
                });
            }

            $medicalRecords = $query->orderBy('created_at', 'desc')->get();
        } else {
            // Si es un profesional, solo ver expedientes de sus estudiantes asignados
            $medicalRecords = MedicalRecord::with([
                'student.user',
                'creator',
                'medicalConsultations'
            ])
                ->whereHas('student', function ($query) use ($user) {
                    $query->whereHas('assignments', function ($q) use ($user) {
                        $q->where('professional_id', $user->id)
                            ->where('type', 'medical')
                            ->where('is_active', true);
                    });
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('clinical-records/medical-record/dashboard-medical-records', [
            'medicalRecords' => $medicalRecords,
        ]);
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
        // Obtener estudiante y calcular si es menor (antes de cualquier procesamiento)
        $student = Estudiante::where('nie', $request->student_nie)->firstOrFail();
        $isMinor = $student->isMinor();
        $request->merge(['is_minor' => $isMinor]);

        // Verificar permisos adicionales
        $this->authorize('create', MedicalConsultation::class);

        // Si se incluyen datos de consentimiento, verificar permiso
        if ($request->has('consent') || $request->has('consent_form_id')) {
            $this->authorize('create', ConsentForm::class);
        }

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
            'student.user', // Cargar la relación user del estudiante para la policy
            'creator',
            'medicalConsultations.doctor',
            'medicalConsultations.consentForm.responsible'
        ]);

        // Determinar el origen de la navegación para los breadcrumbs
        $source = $request->query('source', 'assignments');

        return Inertia::render('clinical-records/medical-record/show-medical-record', [
            'medicalRecord' => $medicalRecord,
            'permissions' => [
                'canUpdate' => $request->user()->can('update', $medicalRecord),
                'canDelete' => $request->user()->can('delete', $medicalRecord),
            ],
            'source' => $source,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     * 
     * Este método no se utiliza ya que la edición se hace mediante un Dialog en el show.
     */
    public function edit(MedicalRecord $medicalRecord)
    {
        $this->authorize('update', $medicalRecord);

        // Redirigir al show donde está el Dialog de edición
        return redirect()->route('clinical-records.medical-records.show', $medicalRecord);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicalRecordRequest $request, MedicalRecord $medicalRecord)
    {
        $this->authorize('update', $medicalRecord);

        try {
            // Actualizar solo los antecedentes médicos
            $medicalRecord->update([
                'general_background' => $request->input('general_background'),
                'updated_by' => $request->user()->id,
            ]);

            return redirect()
                ->back()
                ->with('success', 'Antecedentes médicos actualizados exitosamente.');

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al actualizar los antecedentes médicos: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     * 
     * Los expedientes médicos NO deben ser eliminables por razones de auditoría y legales.
     * Esta acción está completamente deshabilitada.
     */
    public function destroy(MedicalRecord $medicalRecord)
    {
        // Denegar siempre la eliminación de expedientes médicos
        abort(403, 'Los expedientes médicos no pueden ser eliminados por razones de auditoría y cumplimiento legal.');
    }
}

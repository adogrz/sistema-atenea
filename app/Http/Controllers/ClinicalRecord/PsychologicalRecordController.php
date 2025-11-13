<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesConsentForms;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesStudentData;
use App\Http\Requests\ClinicalRecord\StorePsychologicalRecordRequest;
use App\Http\Requests\ClinicalRecord\UpdatePsychologicalRecordRequest;
use App\Models\ClinicalRecord\ConsentForm;
use App\Models\ClinicalRecord\PsychologicalRecord;
use App\Models\ClinicalRecord\PsychologicalSession;
use App\Models\Estudiante;
use App\Services\ClinicalRecord\ConsentFormCreator;
use App\Services\ClinicalRecord\PsychologicalRecordCreator;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PsychologicalRecordController extends Controller
{
    use HandlesStudentData, HandlesConsentForms;

    public function __construct(
        private PsychologicalRecordCreator $psychologicalRecordCreator,
        private ConsentFormCreator $consentFormCreator
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', PsychologicalRecord::class);

        $user = $request->user();

        // Si el usuario tiene permiso para ver todos los expedientes (jefe)
        if ($user->can('psychological-records:view-all')) {
            $query = PsychologicalRecord::with([
                'student.user',
                'creator',
                'psychologicalSessions'
            ]);

            // Filtrar por sede si el usuario tiene sede asignada
            if ($user->sede_name) {
                $query->whereHas('student.user', function ($q) use ($user) {
                    $q->where('sede_name', $user->sede_name);
                });
            }

            $psychologicalRecords = $query->orderBy('created_at', 'desc')->get();
        } else {
            // Si es un profesional, solo ver expedientes de sus estudiantes asignados
            $psychologicalRecords = PsychologicalRecord::with([
                'student.user',
                'creator',
                'psychologicalSessions'
            ])
                ->whereHas('student', function ($query) use ($user) {
                    $query->whereHas('assignments', function ($q) use ($user) {
                        $q->where('professional_id', $user->id)
                            ->where('type', 'psychological')
                            ->where('is_active', true);
                    });
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('clinical-records/psychological-record/dashboard-psychological-records', [
            'psychologicalRecords' => $psychologicalRecords,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->authorize('create', PsychologicalRecord::class);

        $studentNie = $request->input('student_nie', '');

        if (!$studentNie) {
            return redirect()
                ->route('clinical-records.assignments.index')
                ->withErrors(['error' => 'NIE del estudiante no proporcionado']);
        }

        // Verificar si ya existe un expediente psicológico para este estudiante
        $existingRecord = PsychologicalRecord::where('student_nie', $studentNie)->first();

        if ($existingRecord) {
            // Si ya existe, redirigir al show
            return redirect()->route('clinical-records.psychological-records.show', $existingRecord);
        }

        // Preparar datos del estudiante usando el trait
        $studentData = $this->prepareStudentData($studentNie, ConsentForm::TYPE_PSYCHOLOGICAL);

        return Inertia::render('clinical-records/psychological-record/create-psychological-record', [
            'student_nie' => $studentNie,
            'student' => $studentData['student'],
            'responsables' => $studentData['responsables'],
            'existing_consents' => $studentData['existing_consents'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePsychologicalRecordRequest $request)
    {
        // Obtener estudiante y calcular si es menor
        $student = Estudiante::where('nie', $request->student_nie)->firstOrFail();
        $isMinor = $student->isMinor();
        $request->merge(['is_minor' => $isMinor]);

        // Verificar permisos adicionales
        $this->authorize('create', PsychologicalSession::class);

        // Si se incluyen datos de consentimiento, verificar permiso
        if ($request->has('consent') || $request->has('consent_form_id')) {
            $this->authorize('create', ConsentForm::class);
        }

        try {
            $psychologicalRecord = DB::transaction(function () use ($request, $isMinor) {
                // Procesar el consentimiento informado si es necesario
                $consentFormId = $this->processConsentForm($request, $request->student_nie, $isMinor);

                // Preparar datos validados con el consent_form_id
                $validatedData = $request->validated();
                $validatedData['consent_form_id'] = $consentFormId;

                // Crear el expediente psicológico usando el servicio
                // Nota: El servicio también usa transacción, pero al estar dentro de esta transacción
                // externa, se comportará como una transacción anidada (savepoint)
                return $this->psychologicalRecordCreator->create(
                    $validatedData,
                    $request->user()->id
                );
            });

            return redirect()
                ->route('clinical-records.psychological-records.show', $psychologicalRecord)
                ->with('success', 'Expediente psicológico creado exitosamente.');

        } catch (Exception $e) {

            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Ocurrió un error al crear el expediente psicológico: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, PsychologicalRecord $psychologicalRecord)
    {
        $this->authorize('view', $psychologicalRecord);

        $psychologicalRecord->load([
            'student.user', // Cargar la relación user del estudiante para la policy
            'creator',
            'psychologicalSessions.psychologist',
            'psychologicalSessions.consentForm.responsible'
        ]);

        // Determinar el origen de la navegación para los breadcrumbs
        $source = $request->query('source', 'assignments');

        return Inertia::render('clinical-records/psychological-record/show-psychological-record', [
            'psychologicalRecord' => $psychologicalRecord,
            'permissions' => [
                'canUpdate' => $request->user()->can('update', $psychologicalRecord),
                'canDelete' => $request->user()->can('delete', $psychologicalRecord),
            ],
            'source' => $source,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * Este método no se utiliza ya que la edición se hace mediante un Dialog en el show.
     */
    public function edit(PsychologicalRecord $psychologicalRecord)
    {
        $this->authorize('update', $psychologicalRecord);

        // Redirigir al show donde está el Dialog de edición
        return redirect()->route('clinical-records.psychological-records.show', $psychologicalRecord);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePsychologicalRecordRequest $request, PsychologicalRecord $psychologicalRecord)
    {
        $this->authorize('update', $psychologicalRecord);

        try {
            // Actualizar solo la evaluación inicial
            $psychologicalRecord->update([
                'initial_assessment' => $request->input('initial_assessment'),
                'change_justification' => $request->input('justification'),
            ]);

            return redirect()
                ->back()
                ->with('success', 'Evaluación inicial actualizada exitosamente.');

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al actualizar la evaluación inicial: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * Los expedientes psicológicos NO deben ser eliminables por razones de auditoría y legales.
     * Esta acción está completamente deshabilitada.
     */
    public function destroy(PsychologicalRecord $psychologicalRecord)
    {
        // Denegar siempre la eliminación de expedientes psicológicos
        abort(403, 'Los expedientes psicológicos no pueden ser eliminados por razones de auditoría y cumplimiento legal.');
    }
}

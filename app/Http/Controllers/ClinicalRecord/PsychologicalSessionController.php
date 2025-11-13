<?php

namespace App\Http\Controllers\ClinicalRecord;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesConsentForms;
use App\Http\Controllers\ClinicalRecord\Concerns\HandlesStudentData;
use App\Http\Requests\ClinicalRecord\StorePsychologicalSessionRequest;
use App\Http\Requests\ClinicalRecord\UpdatePsychologicalSessionRequest;
use App\Models\ClinicalRecord\ConsentForm;
use App\Models\ClinicalRecord\PsychologicalRecord;
use App\Models\ClinicalRecord\PsychologicalSession;
use App\Services\ClinicalRecord\ConsentFormCreator;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PsychologicalSessionController extends Controller
{
    use HandlesStudentData, HandlesConsentForms;

    public function __construct(
        private ConsentFormCreator $consentFormCreator
    ) {}

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request, PsychologicalRecord $psychologicalRecord)
    {
        $this->authorize('create', PsychologicalSession::class);
        $this->authorize('view', $psychologicalRecord);

        // Cargar relaciones necesarias del expediente
        $psychologicalRecord->load('student');

        // Preparar datos del estudiante usando el trait con filtro de tipo psicológico
        $studentData = $this->prepareStudentData($psychologicalRecord->student_nie, ConsentForm::TYPE_PSYCHOLOGICAL);

        return Inertia::render('clinical-records/psychological-session/create-psychological-session', [
            'psychological_record' => [
                'id' => $psychologicalRecord->id,
                'student_nie' => $psychologicalRecord->student_nie,
                'initial_assessment' => $psychologicalRecord->initial_assessment,
                'created_at' => $psychologicalRecord->created_at->format('Y-m-d'),
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
    public function store(StorePsychologicalSessionRequest $request, PsychologicalRecord $psychologicalRecord)
    {
        $this->authorize('create', PsychologicalSession::class);
        $this->authorize('view', $psychologicalRecord);

        DB::beginTransaction();

        try {
            // Determinar si el estudiante es menor y procesar consentimiento
            $isMinor = $request->input('is_minor', false);
            $consentFormId = $this->processConsentForm($request, $psychologicalRecord->student_nie, $isMinor, ConsentForm::TYPE_PSYCHOLOGICAL);

            // Crear la sesión psicológica
            $psychologicalSession = PsychologicalSession::create([
                'psychological_record_id' => $psychologicalRecord->id,
                'psychologist_id' => $request->user()->id,
                'consent_form_id' => $consentFormId,
                'session_date' => $request->input('session_date'),
                'session_content' => $request->input('session_content'),
                'interventions' => $request->input('interventions'),
                'conclusions' => $request->input('conclusions'),
            ]);

            DB::commit();

            return redirect()
                ->route('clinical-records.psychological-records.show', $psychologicalRecord)
                ->with('success', 'Sesión psicológica creada exitosamente.');

        } catch (Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Ocurrió un error al crear la sesión psicológica: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, PsychologicalRecord $psychologicalRecord, PsychologicalSession $session)
    {
        // Verificar permisos
        $this->authorize('view', $session);
        $this->authorize('view', $psychologicalRecord);

        // Verificar que la sesión pertenezca al expediente
        if ($session->psychological_record_id !== $psychologicalRecord->id) {
            abort(404, 'La sesión no pertenece a este expediente psicológico.');
        }

        // Cargar relaciones necesarias
        $session->load([
            'psychologist',
            'consentForm.responsible',
        ]);

        $psychologicalRecord->load('student');

        return Inertia::render('clinical-records/psychological-session/show-psychological-session', [
            'session' => [
                'id' => $session->id,
                'psychological_record_id' => $session->psychological_record_id,
                'psychologist_id' => $session->psychologist_id,
                'consent_form_id' => $session->consent_form_id,
                'session_date' => $session->session_date->format('d/m/Y'),
                'session_content' => $session->session_content,
                'interventions' => $session->interventions,
                'conclusions' => $session->conclusions,
                'change_justification' => $session->change_justification,
                'created_at' => $session->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $session->updated_at->format('Y-m-d H:i:s'),
                'psychologist' => $session->psychologist,
                'consent_form' => $session->consentForm ? [
                    'id' => $session->consentForm->id,
                    'student_nie' => $session->consentForm->student_nie,
                    'responsible_id' => $session->consentForm->responsible_id,
                    'type' => $session->consentForm->type,
                    'granted_at' => $session->consentForm->granted_at->format('d/m/Y'),
                    'file_path' => $session->consentForm->file_path,
                    'observations' => $session->consentForm->observations,
                    'responsible' => $session->consentForm->responsible,
                ] : null,
            ],
            'psychological_record' => [
                'id' => $psychologicalRecord->id,
                'student_nie' => $psychologicalRecord->student_nie,
                'initial_assessment' => $psychologicalRecord->initial_assessment,
                'created_at' => $psychologicalRecord->created_at->format('Y-m-d'),
            ],
            'student' => $psychologicalRecord->student,
            'permissions' => [
                'canUpdate' => $request->user()->can('update', $session),
                'canDelete' => $request->user()->can('delete', $session),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, PsychologicalRecord $psychologicalRecord, PsychologicalSession $session)
    {
        // Verificar permisos
        $this->authorize('update', $session);
        $this->authorize('view', $psychologicalRecord);

        // Verificar que la sesión pertenezca al expediente
        if ($session->psychological_record_id !== $psychologicalRecord->id) {
            abort(404, 'La sesión no pertenece a este expediente psicológico.');
        }

        // Cargar relaciones necesarias
        $session->load([
            'psychologist',
            'psychologicalRecord.student',
        ]);

        return Inertia::render('clinical-records/psychological-session/edit-psychological-session', [
            'session' => [
                'id' => $session->id,
                'psychological_record_id' => $session->psychological_record_id,
                'session_date' => $session->session_date->format('Y-m-d'),
                'session_content' => $session->session_content,
                'interventions' => $session->interventions,
                'conclusions' => $session->conclusions,
                'created_at' => $session->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $session->updated_at->format('Y-m-d H:i:s'),
                'psychological_record' => [
                    'id' => $session->psychologicalRecord->id,
                    'student_nie' => $session->psychologicalRecord->student_nie,
                    'student' => [
                        'nie' => $session->psychologicalRecord->student->nie,
                        'primer_nombre' => $session->psychologicalRecord->student->primer_nombre,
                        'segundo_nombre' => $session->psychologicalRecord->student->segundo_nombre,
                        'primer_apellido' => $session->psychologicalRecord->student->primer_apellido,
                        'segundo_apellido' => $session->psychologicalRecord->student->segundo_apellido,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePsychologicalSessionRequest $request, PsychologicalRecord $psychologicalRecord, PsychologicalSession $session)
    {
        // Verificar permisos
        $this->authorize('update', $session);
        $this->authorize('view', $psychologicalRecord);

        // Verificar que la sesión pertenezca al expediente
        if ($session->psychological_record_id !== $psychologicalRecord->id) {
            abort(404, 'La sesión no pertenece a este expediente psicológico.');
        }

        DB::beginTransaction();

        try {
            // Actualizar la sesión psicológica con los datos validados
            $session->update([
                'session_date' => $request->input('session_date'),
                'session_content' => $request->input('session_content'),
                'interventions' => $request->input('interventions'),
                'conclusions' => $request->input('conclusions'),
                'change_justification' => $request->input('change_justification'),
            ]);

            DB::commit();

            return redirect()
                ->route('clinical-records.psychological-records.show', $psychologicalRecord->id)
                ->with('success', 'Sesión psicológica actualizada exitosamente.');

        } catch (Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Error al actualizar la sesión psicológica: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, PsychologicalRecord $psychologicalRecord, PsychologicalSession $session)
    {
        // Verificar permisos
        $this->authorize('delete', $session);
        $this->authorize('view', $psychologicalRecord);

        // Verificar que la sesión pertenezca al expediente
        if ($session->psychological_record_id !== $psychologicalRecord->id) {
            abort(404, 'La sesión no pertenece a este expediente psicológico.');
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
            'justification.required' => 'La justificación es requerida para eliminar una sesión psicológica.',
            'justification.min' => 'La justificación debe tener al menos 10 caracteres.',
            'justification.max' => 'La justificación no puede superar los 1000 caracteres.',
        ]);

        try {
            // Guardar la justificación antes de eliminar
            $session->change_justification = $validated['justification'];
            $session->save();

            // Soft delete de la sesión
            $session->delete();

            // No redirigir, dejar que Inertia maneje la respuesta
            // El frontend mostrará el toast con el botón de deshacer
            return back();

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al eliminar la sesión psicológica: ' . $e->getMessage()]);
        }
    }

    /**
     * Restore a soft-deleted session.
     * Solo accesible para sesiones recientemente eliminadas (dentro del período de "deshacer").
     */
    public function restore(Request $request, PsychologicalRecord $psychologicalRecord, $sessionId)
    {
        // Buscar la sesión eliminada (withTrashed para incluir soft deleted)
        $session = PsychologicalSession::withTrashed()->findOrFail($sessionId);

        // Verificar permisos
        $this->authorize('restore', $session);
        $this->authorize('view', $psychologicalRecord);

        // Verificar que la sesión pertenezca al expediente
        if ($session->psychological_record_id !== $psychologicalRecord->id) {
            abort(404, 'La sesión no pertenece a este expediente psicológico.');
        }

        // Verificar que la sesión esté eliminada
        if (!$session->trashed()) {
            return redirect()
                ->route('clinical-records.psychological-records.show', $psychologicalRecord)
                ->withErrors(['error' => 'La sesión no está eliminada.']);
        }

        try {
            // Restaurar la sesión
            $session->restore();

            // Limpiar la justificación de eliminación ya que se revirtió la acción
            $session->change_justification = null;
            $session->save();

            // No redirigir, dejar que Inertia maneje la respuesta
            return back();

        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Ocurrió un error al restaurar la sesión psicológica: ' . $e->getMessage()]);
        }
    }
}

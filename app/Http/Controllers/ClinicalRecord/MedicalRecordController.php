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

        // TODO: Implementar vista de creación de expediente médico
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

        // TODO: Implementar vista de detalle de expediente médico
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

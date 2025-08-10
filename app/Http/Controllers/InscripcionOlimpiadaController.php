<?php

namespace App\Http\Controllers;

use App\Models\BitacoraInscripcion;
use App\Models\InscripcionOlimpiada;
use App\Models\FaseOlimpiada;
use App\Services\OlimpiadaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionOlimpiadaController extends Controller
{
    protected OlimpiadaService $olimpiadaService;

    /**
     * Constructor de la clase InscripcionOlimpiadaController.
     *
     * @param OlimpiadaService $olimpiadaService
     */
    public function __construct(OlimpiadaService $olimpiadaService)
    {
        $this->olimpiadaService = $olimpiadaService;
    }

    /**
     * Muestra todas las inscripciones (admin/estudiante).
     */
    public function index(): Response
    {
        $user = Auth::user();
        $estudiante = $user->estudiante;

        abort_if(!$estudiante, 403, 'No se encontró perfil de estudiante.');

        // Cargar relaciones del estudiante
        $estudiante->load(['centroEducativo', 'nivelEducativo']);

        // Obtener fases vigentes e inscripciones agrupadas
        $fasesVigentes = $this->olimpiadaService->fasesVigentesAgrupadas();
        $inscripciones = $this->olimpiadaService->inscripcionesPorEstudiante($estudiante->codigo);
        $puedeInscribirse = $this->olimpiadaService->puedeInscribirse($fasesVigentes, $inscripciones);

        return Inertia::render('dashboard-students', [
            'fasesAgrupadas' => $fasesVigentes,
            'estudiante' => [
                'codigo' => $estudiante->codigo,
                'nombre_completo' => trim("{$estudiante->primer_nombre} {$estudiante->segundo_nombre} {$estudiante->primer_apellido} {$estudiante->segundo_apellido}"),
                'centro_educativo' => $estudiante->centroEducativo->nombre,
                'nivel_educativo' => $estudiante->nivelEducativo->descripcion,
                'nivel' => $estudiante->nivel,
            ],
            'inscripciones' => $inscripciones,
            'puedeInscribirse' => $puedeInscribirse,
        ]);
    }

    public function create(Request $request): Response
    {
        $hoy = Carbon::today();

        // Fases vigentes agrupadas por olimpiada
        $fasesVigentes = FaseOlimpiada::with('olimpiada')
            ->where('activa', true)
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_fin', '>=', $hoy)
            ->orderBy('olimpiada_id')
            ->orderBy('numero_fase')
            ->get()
            ->groupBy('olimpiada_id');

        $estudiante = Auth::user()->estudiante ?? null;

        $inscripciones = collect();
        $puedeInscribirse = [];

        if ($estudiante) {
            $inscripciones = InscripcionOlimpiada::where('codigo_estudiante', $estudiante->codigo)
                ->get()
                ->groupBy(function ($insc) {
                    return $insc->fase->olimpiada_id;
                });

            foreach ($fasesVigentes as $olimpiadaId => $fases) {
                $primeraFase = $fases->first();
                $yaInscrito = isset($inscripciones[$olimpiadaId]) &&
                    $inscripciones[$olimpiadaId]->contains('fase_id', $primeraFase->id);

                $puedeInscribirse[$olimpiadaId] = !$yaInscrito;
            }
        }

        return Inertia::render('dashboard-students', [
            'fasesAgrupadas' => $fasesVigentes,
            'estudiante' => $estudiante,
            'puedeInscribirse' => $puedeInscribirse,
        ]);
    }

    /**
     * Guarda una nueva inscripción.
     */
    public function store(Request $request)
    {
        $request->validate([
            'fase_id' => 'required|exists:fases_olimpiadas,id',
            'codigo_estudiante' => 'required|exists:estudiantes,codigo',
        ]);

        $yaExiste = InscripcionOlimpiada::where('fase_id', $request->fase_id)
            ->where('codigo_estudiante', $request->codigo_estudiante)
            ->first();

        if ($yaExiste) {
            return back()->withErrors(['msg' => 'Ya existe una inscripción para este estudiante en esta fase.']);
        }

        $inscripcion = InscripcionOlimpiada::create([
            'fase_id' => $request->fase_id,
            'codigo_estudiante' => $request->codigo_estudiante,
            'fecha_inscripcion' => now(),
        ]);

        BitacoraInscripcion::create([
            'inscripcion_id' => $inscripcion->id,
            'usuario_id' => Auth::id(),
            'accion' => 'inscripcion',
        ]);

        return redirect()->route('inscripciones.index')->with('success', 'Inscripción registrada correctamente.');
    }

    /**
     * Muestra una inscripción específica.
     */
    public function show(InscripcionOlimpiada $inscripcion): Response
    {
        $inscripcion->load(['fase.olimpiada', 'participante', 'estado']);

        return Inertia::render('Olympics/InscripcionShow', [
            'inscripcion' => $inscripcion,
        ]);
    }

    /**
     * Actualiza una inscripción.
     */
    public function update(Request $request, InscripcionOlimpiada $inscripcion)
    {
        $request->validate([
            'estado_id' => 'exists:estados_inscripciones,id',
            'observaciones' => 'nullable|string',
            'activa' => 'boolean',
        ]);

        $inscripcion->update($request->only([
            'estado_id',
            'observaciones',
            'activa',
        ]));

        return redirect()->route('inscripciones.index')->with('success', 'Inscripción actualizada correctamente.');
    }

    /**
     * Elimina (soft delete) la inscripción.
     */
    public function destroy(InscripcionOlimpiada $inscripcion)
    {
        $inscripcion->delete();

        return redirect()->route('inscripciones.index')->with('success', 'Inscripción eliminada correctamente.');
    }
}

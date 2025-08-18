<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscripcionOlimpiadaRequest;
use App\Http\Requests\UpdateInscripcionOlimpiadaRequest;
use App\Models\EstadoInscripcion;
use App\Models\FaseOlimpiada;
use App\Models\InscripcionOlimpiada;
use App\Services\OlimpiadaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionOlimpiadaController extends Controller
{
    public function __construct(
        protected OlimpiadaService $olimpiadaService
    ) {}

    public function index(): Response
    {
        $user = Auth::user();
        $estudiante = $user?->estudiante;

        abort_if(!$estudiante, 403, 'No se encontró perfil de estudiante.');

        $estudiante->loadMissing(['centroEducativo', 'nivelEducativo']);

        $fasesVigentes    = $this->olimpiadaService->fasesVigentesAgrupadas();
        $inscripciones    = $this->olimpiadaService->inscripcionesPorEstudiante($estudiante->codigo);
        $puedeInscribirse = $this->olimpiadaService->puedeInscribirse($fasesVigentes, $inscripciones);

        return Inertia::render('dashboard-students', [
            'fasesAgrupadas' => $fasesVigentes,
            'estudiante' => [
                'codigo'           => $estudiante->codigo,
                'nombre_completo'  => trim("{$estudiante->primer_nombre} {$estudiante->segundo_nombre} {$estudiante->primer_apellido} {$estudiante->segundo_apellido}"),
                'centro_educativo' => $estudiante->centroEducativo?->nombre ?? '-',
                'nivel_educativo'  => $estudiante->nivelEducativo?->descripcion ?? '-',
                'nivel'            => $estudiante->nivel,
            ],
            'inscripciones'    => $inscripciones,
            'puedeInscribirse' => $puedeInscribirse,
        ]);
    }

    public function create(): Response
    {
        $estudiante = Auth::user()?->estudiante;

        $fasesVigentes    = $this->olimpiadaService->fasesVigentesAgrupadas();
        $inscripciones    = $estudiante
            ? $this->olimpiadaService->inscripcionesPorEstudiante($estudiante->codigo)
            : collect();
        $puedeInscribirse = $this->olimpiadaService->puedeInscribirse($fasesVigentes, $inscripciones);

        return Inertia::render('dashboard-students', [
            'fasesAgrupadas'   => $fasesVigentes,
            'estudiante'       => $estudiante,
            'inscripciones'    => $inscripciones,
            'puedeInscribirse' => $puedeInscribirse,
        ]);
    }

    /**
     * Crea una nueva inscripción.
     * Espera (en el request): olimpiada_id, estudiante_codigo
     */
    public function store(StoreInscripcionOlimpiadaRequest $request): RedirectResponse
{
    $faseId = $request->integer('fase_id');
    $codigoEstudiante = $request->string('codigo_estudiante');

    $fase = FaseOlimpiada::findOrFail($faseId);

    // Bloquear inscripción si el estudiante ya tiene una fase activa sin finalizar
    $yaTieneFaseNoFinal = InscripcionOlimpiada::where('estudiante_codigo', $codigoEstudiante)
        ->where('olimpiada_id', $fase->olimpiada_id)
        ->whereHas('estado', fn ($q) => $q->where('es_final', false))
        ->exists();

    if ($yaTieneFaseNoFinal) {
        return back()->withErrors([
            'msg' => 'No puedes inscribirte a esta fase hasta completar la anterior.',
        ]);
    }

    $estadoPendienteId = EstadoInscripcion::where('nombre', 'pendiente')->value('id');

    InscripcionOlimpiada::create([
        'olimpiada_id' => $fase->olimpiada_id,
        'estudiante_codigo' => $codigoEstudiante,
        'estado_inscripcion_id' => $estadoPendienteId,
        'fecha_inscripcion' => now(),
    ]);

    return redirect()
        ->route('inscripciones.index')
        ->with('success', 'Inscripción registrada correctamente.');
}

    public function show(InscripcionOlimpiada $inscripcion): Response
    {
        // $this->authorize('view', $inscripcion);
        // Ajusta los nombres de relaciones según tu modelo:
        // - 'olimpiada' (belongsTo)
        // - 'participante' (belongsTo Estudiante::class, 'estudiante_codigo', 'codigo')
        // - 'estado' (belongsTo EstadoInscripcion::class, 'estado_inscripcion_id')
        $inscripcion->load(['olimpiada', 'participante', 'estado']);

        return Inertia::render('Olympics/InscripcionShow', [
            'inscripcion' => $inscripcion,
        ]);
    }

    public function update(UpdateInscripcionOlimpiadaRequest $request, InscripcionOlimpiada $inscripcion): RedirectResponse
    {
        // $this->authorize('update', $inscripcion);

        $data = $request->validated();

        // Si se intenta cambiar el estado, validamos transición
        if (array_key_exists('estado_inscripcion_id', $data) && $data['estado_inscripcion_id']) {
            $nuevoEstado = EstadoInscripcion::find($data['estado_inscripcion_id']);
            if ($nuevoEstado) {
                $inscripcion->loadMissing('estado');
                $estadoActual = $inscripcion->estado;

                if ($estadoActual && $estadoActual->es_final && $estadoActual->id !== $nuevoEstado->id) {
                    return back()->withErrors([
                        'estado_inscripcion_id' => 'La inscripción está en un estado final y no puede modificarse.',
                    ]);
                }
            }
        }

        $inscripcion->update($data);

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción actualizada correctamente.');
    }

    public function destroy(InscripcionOlimpiada $inscripcion): RedirectResponse
    {
        // $this->authorize('delete', $inscripcion);

        DB::transaction(function () use ($inscripcion) {
            $inscripcion->delete();
        });

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción eliminada correctamente.');
    }

    /**
     * Cambio de estado con reglas.
     * Request: estado_inscripcion_id
     */
    public function cambiarEstado(Request $request, InscripcionOlimpiada $inscripcion): RedirectResponse
    {
        // $this->authorize('update', $inscripcion);

        $validated = $request->validate([
            'estado_inscripcion_id' => ['required', 'integer', 'exists:estados_inscripciones,id'],
        ]);

        $inscripcion->loadMissing('estado');

        if ($inscripcion->estado && $inscripcion->estado->es_final && $inscripcion->estado_inscripcion_id !== (int) $validated['estado_inscripcion_id']) {
            return back()->withErrors([
                'estado_inscripcion_id' => 'La inscripción está en un estado final y no puede modificarse.',
            ]);
        }

        $inscripcion->update([
            'estado_inscripcion_id' => (int) $validated['estado_inscripcion_id'],
        ]);

        return back()->with('success', 'Estado de la inscripción actualizado correctamente.');
    }
}

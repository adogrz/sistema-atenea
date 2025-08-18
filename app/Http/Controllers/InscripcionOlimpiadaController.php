<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscripcionOlimpiadaRequest;
use App\Http\Requests\UpdateInscripcionOlimpiadaRequest;
use App\Models\EstadoInscripcion;
use App\Models\FaseOlimpiada;
use App\Models\InscripcionOlimpiada;
use App\Rules\FasePreviaPasadaRule;
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
    public function store(Request $request): RedirectResponse
    {
        // Asumimos que el usuario autenticado tiene el "código" del estudiante
        $estudianteCodigo = $request->user()?->estudiante?->codigo
            ?? $request->input('estudiante_codigo'); // fallback si lo envías en el form

        $validated = $request->validate([
            'fase_olimpiada_id' => [
                'required',
                'integer',
                'exists:fases_olimpiadas,id',
                new FasePreviaPasadaRule((string)$estudianteCodigo),
            ],
        ]);

        DB::transaction(function () use ($validated, $estudianteCodigo) {
            // 1) Resolver inscripcion_id por (olimpiada_id, estudiante_codigo)
            $fase = DB::table('fases_olimpiadas')->select('id', 'olimpiada_id')->where('id', $validated['fase_olimpiada_id'])->first();
            $inscripcion = DB::table('inscripciones_olimpiadas')
                ->where('olimpiada_id', $fase->olimpiada_id)
                ->where('estudiante_codigo', $estudianteCodigo)
                ->first();

            // 2) Crear evaluación/participación para la fase seleccionada (si no existe)
            DB::table('evaluaciones_fase')->updateOrInsert(
                [
                    'inscripcion_id'   => $inscripcion->id,
                    'fase_olimpiada_id' => $fase->id,
                ],
                [
                    'finalizada' => 0,
                    'aprobada'   => 0,
                    // 'total'    => null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        });

        return back()->with('success', 'Inscripción registrada correctamente.');
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

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInscripcionOlimpiadaRequest;
use App\Http\Requests\UpdateInscripcionOlimpiadaRequest;
use App\Models\EstadoInscripcion;
use App\Models\InscripcionOlimpiada;
use App\Services\OlimpiadaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controlador de Inscripciones a Olimpiadas con manejo de estado.
 *
 * - Al crear: asigna estado por defecto "pendiente" si existe.
 * - Al actualizar: permite cambiar estado salvo que el actual sea final (no se puede mover desde un estado final).
 * - Bitácora: se registra vía Observer (created => 'inscripcion', deleted => 'desinscripcion').
 */
class InscripcionOlimpiadaController extends Controller
{
    /**
     * Constructor para el controlador de inscripciones a olimpiadas.
     * @var OlimpiadaService
     */
    public function __construct(
        protected OlimpiadaService $olimpiadaService
    ) {
        // $this->authorizeResource(InscripcionOlimpiada::class, 'inscripcion');
    }

    /**
     * Formulario de inscripción (mismo dataset que index para reutilizar UI).
     *
     * @return Response
     */
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

    /**
     * Crea una nueva inscripción.
     *
     * Validación:
     *  - fase_id: exists:fases_olimpiadas,id
     *  - codigo_estudiante: exists:estudiantes,codigo
     *  - unique compuesto (fase_id + codigo_estudiante) considerando soft deletes.
     *
     * Auditoría:
     *  - Observer registrará 'inscripcion' en bitácora al crear.
     *
     * @param  StoreInscripcionOlimpiadaRequest $request
     * @return RedirectResponse
     */
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
     *
     * Validación:
     *  - fase_id: exists:fases_olimpiadas,id
     *  - codigo_estudiante: exists:estudiantes,codigo
     *  - unique compuesto (fase_id + codigo_estudiante) considerando soft deletes.
     *
     * Auditoría:
     *  - Observer registrará 'inscripcion' en bitácora al crear.
     *
     * @param  StoreInscripcionOlimpiadaRequest $request
     * @return RedirectResponse
     */
    public function store(StoreInscripcionOlimpiadaRequest $request): RedirectResponse
    {
        // $this->authorize('create', InscripcionOlimpiada::class);

        DB::transaction(function () use ($request) {
            // Buscar estado 'pendiente' si existe
            $estadoPendienteId = EstadoInscripcion::where('nombre', 'pendiente')->value('id');

            InscripcionOlimpiada::create([
                'fase_id'           => $request->integer('fase_id'),
                'codigo_estudiante' => $request->string('codigo_estudiante'),
                'fecha_inscripcion' => now(),
                'estado_id'         => $estadoPendienteId, // puede quedar null si no existe
            ]);
            // Bitácora -> Observer (created)
        });

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción registrada correctamente.');
    }

    /**
     * Muestra una inscripción.
     */ /**
     * Muestra una inscripción específica.
     *
     * @param  InscripcionOlimpiada $inscripcion (route-model binding)
     * @return Response
     */
    public function show(InscripcionOlimpiada $inscripcion): Response
    {
        // $this->authorize('view', $inscripcion);
        $inscripcion->load(['fase.olimpiada', 'participante', 'estado']);

        return Inertia::render('Olympics/InscripcionShow', [
            'inscripcion' => $inscripcion,
        ]);
    }

    /**
     * Actualiza campos de la inscripción.
     *
     * NOTA: tu migración de bitácora solo contempla 'inscripcion' y 'desinscripcion',
     * por ello no se registra 'actualizacion'. Si en el futuro agregas 'actualizacion'
     * al enum, puedes anotar el evento 'updated' en el Observer.
     *
     * @param  UpdateInscripcionOlimpiadaRequest $request
     * @param  InscripcionOlimpiada $inscripcion
     * @return RedirectResponse
     */
    public function update(UpdateInscripcionOlimpiadaRequest $request, InscripcionOlimpiada $inscripcion): RedirectResponse
    {
        // $this->authorize('update', $inscripcion);

        $data = $request->validated();

        // Manejo de estado: si viene estado_id y cambia, validar transición
        if (array_key_exists('estado_id', $data) && $data['estado_id']) {
            $nuevoEstado = EstadoInscripcion::find($data['estado_id']);
            if ($nuevoEstado) {
                $inscripcion->loadMissing('estado');
                $estadoActual = $inscripcion->estado;

                // No permitir cambios si el estado actual es final y difiere del nuevo
                if ($estadoActual && $estadoActual->es_final && $estadoActual->id !== $nuevoEstado->id) {
                    return back()->withErrors([
                        'estado_id' => 'La inscripción está en un estado final y no puede modificarse.',
                    ]);
                }
            }
        }

        $inscripcion->update($data);

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción actualizada correctamente.');
    }

    /**
     * Elimina (soft delete recomendado) la inscripción.
     *
     * Auditoría:
     *  - Observer registrará 'desinscripcion' en bitácora al eliminar.
     *
     * @param  InscripcionOlimpiada $inscripcion
     * @return RedirectResponse
     */
    public function destroy(InscripcionOlimpiada $inscripcion): RedirectResponse
    {
        // $this->authorize('delete', $inscripcion);

        DB::transaction(function () use ($inscripcion) {
            $inscripcion->delete();
            // Bitácora -> Observer (deleted)
        });

        return redirect()
            ->route('inscripciones.index')
            ->with('success', 'Inscripción eliminada correctamente.');
    }

    /**
     * Endpoint dedicado para cambiar estado con reglas de transición.
     */
    public function cambiarEstado(Request $request, InscripcionOlimpiada $inscripcion): RedirectResponse
    {
        // $this->authorize('update', $inscripcion);

        $validated = $request->validate([
            'estado_id' => ['required', 'integer', 'exists:estados_inscripciones,id'],
        ]);

        $inscripcion->loadMissing('estado');

        // Bloquear si ya está en estado final diferente
        if ($inscripcion->estado && $inscripcion->estado->es_final && $inscripcion->estado_id !== (int) $validated['estado_id']) {
            return back()->withErrors([
                'estado_id' => 'La inscripción está en un estado final y no puede modificarse.',
            ]);
        }

        $inscripcion->update([
            'estado_id' => (int) $validated['estado_id'],
        ]);

        return back()->with('success', 'Estado de la inscripción actualizado correctamente.');
    }
}

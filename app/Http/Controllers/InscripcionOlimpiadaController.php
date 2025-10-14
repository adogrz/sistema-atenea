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

        $fasesVigentes    = $this->olimpiadaService->fasesVigentesAgrupadas($estudiante->nivel_educativo);
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

        $fasesVigentes    = $this->olimpiadaService->fasesVigentesAgrupadas($estudiante?->nivel_educativo);
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
        // El código del estudiante siempre viene del usuario autenticado; 
        // si por alguna razón no existe el perfil, toma el del formulario (mismo nombre que en el TSX).
        $estudianteCodigo = $request->user()?->estudiante?->codigo
            ?? $request->input('codigo_estudiante');

        // Reglas alineadas al TSX (fase_id, codigo_estudiante)
        $validated = validator(
            $request->all(),
            [
                'fase_id'           => ['required', 'integer', 'exists:fases_olimpiadas,id', new FasePreviaPasadaRule((string) $estudianteCodigo)],
                'codigo_estudiante' => ['required', 'string', 'exists:estudiantes,codigo'],
            ],
            [], // mensajes por defecto (usar resources/lang/es/validation.php)
            [
                // aliases legibles
                'fase_id'           => 'fase',
                'codigo_estudiante' => 'código de estudiante',
            ]
        )->validate();

        // Seguridad: el código del form debe coincidir con el del usuario
        abort_if(
            (string) $estudianteCodigo !== (string) $validated['codigo_estudiante'],
            403,
            'El código del estudiante no coincide con el usuario actual.'
        );

        DB::transaction(function () use ($validated, $estudianteCodigo) {
            // 1) Cargar la fase y su olimpiada
            /** @var \App\Models\FaseOlimpiada $fase */
            $fase = FaseOlimpiada::query()
                ->select(['id', 'olimpiada_id'])
                ->findOrFail((int) $validated['fase_id']);

            // 2) Obtener o crear la inscripción del estudiante en esa olimpiada
            /** @var \App\Models\InscripcionOlimpiada $inscripcion */
            $inscripcion = InscripcionOlimpiada::query()
                ->where('olimpiada_id', $fase->olimpiada_id)
                ->where('estudiante_codigo', $estudianteCodigo)
                ->first();

            if (!$inscripcion) {
                // Estado por defecto: intenta 'inscrito', si no existe usa el menor id
                $estadoId = EstadoInscripcion::query()
                    ->where('slug', 'inscrito')
                    ->value('id');

                if (!$estadoId) {
                    $estadoId = EstadoInscripcion::query()->min('id');
                }

                $inscripcion = InscripcionOlimpiada::create([
                    'olimpiada_id'       => $fase->olimpiada_id,
                    'estudiante_codigo'  => $estudianteCodigo,
                    'estado_inscripcion_id' => $estadoId,
                ]);
            }

            // 3) Crear/actualizar evaluación/participación para la fase seleccionada
            DB::table('evaluaciones_fase')->updateOrInsert(
                [
                    'inscripcion_id'    => $inscripcion->id,
                    'fase_olimpiada_id' => $fase->id,
                ],
                [
                    'finalizada' => 0,
                    'aprobada'   => 0,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        });

        return redirect()->back()->with('success', 'Inscripción registrada correctamente.');
    }

    public function show(InscripcionOlimpiada $inscripcion): Response
    {
        // $this->authorize('view', $inscripcion);
        // Ajusta los nombres de relaciones segun el modelo:
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

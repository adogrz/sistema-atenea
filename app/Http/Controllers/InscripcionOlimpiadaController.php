<?php

namespace App\Http\Controllers;

use App\Models\Estado;
use App\Models\InscripcionOlimpiada;
use App\Models\FaseOlimpiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionOlimpiadaController extends Controller
{
    /**
     * Muestra todas las inscripciones (admin).
     */
    public function index(): Response
    {
        $user = Auth::user();
        $estudiante = $user->estudiante;

        if (!$estudiante) {
            abort(403, 'No se encontró perfil de estudiante.');
        }

        // Fases disponibles
        $fases = FaseOlimpiada::with('olimpiada')
            ->where('activa', true)
            ->orderBy('fecha_inicio')
            ->get();

        // Inscripciones realizadas por el estudiante
        $inscripciones = InscripcionOlimpiada::where('participante_id', $estudiante->codigo)
            ->select('fase_id', 'estado') // Puedes incluir más si quieres mostrar fechas
            ->get();

        return Inertia::render('dashboard-students', [
            'fases' => $fases,
            'estudiante' => [
                'codigo' => $estudiante->codigo,
                'nombre_completo' => $estudiante->primer_nombre . ' ' . $estudiante->segundo_nombre . ' ' . $estudiante->primer_apellido . ' ' . $estudiante->segundo_apellido,
                'centro_educativo' => $estudiante->centro_educativo,
                'nivel_educativo' => $estudiante->nivel_educativo,
                'nivel' => $estudiante->nivel,
            ],
            'centro_educativo' => $estudiante->centro_educativo(),
            'inscripciones' => $inscripciones,
        ]);
    }

    /**
     * Muestra el formulario para inscribirse en una fase específica.
     */
    public function create(Request $request): Response
    {
        $fases = FaseOlimpiada::with('olimpiada')->where('activa', true)->get();
        $estudiante = Auth::user()->estudiante ?? null;

        return Inertia::render('dashboard-studens', [
            'fases' => $fases,
            'estudiante' => $estudiante,
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

        InscripcionOlimpiada::create([
            'fase_id' => $request->fase_id,
            'codigo_estudiante' => $request->codigo_estudiante,
            'estado_id' => Estado::where('nombre', 'pendiente')->value('id'),
            'fecha_inscripcion' => now(),
            'activa' => true,
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

        // Si deseas registrar un historial de cambio de estado, puedo ayudarte a agregarlo aquí también.

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

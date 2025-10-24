<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Estudiante;
use App\Models\InternadoParticipante;
use Illuminate\Support\Facades\DB;

class InternadoFDTCController extends Controller
{
    /**
     * Muestra la lista de estudiantes para el internado FDTC
     */
    public function selection_list(): Response
    {
        $estudiantes = Estudiante::with(['user.sede', 'internadoParticipante'])
            ->whereHas('user', function ($query) {
                $query->whereHas('roles', function ($q) {
                    $q->where('name', 'estudiante');
                })
                ->where('status', 'active');
            })
            ->get()
            ->map(function ($estudiante) {
                $nombreCompleto = trim(
                    ($estudiante->primer_nombre ?? '') . ' ' .
                    ($estudiante->segundo_nombre ?? '') . ' ' .
                    ($estudiante->primer_apellido ?? '') . ' ' .
                    ($estudiante->segundo_apellido ?? '')
                );

                $participante = $estudiante->internadoParticipante;
                $enInternado = $participante && !$participante->deleted_at;

                return [
                    'id' => $estudiante->codigo,
                    'codigo' => $estudiante->codigo,
                    'nombre' => $nombreCompleto ?: $estudiante->user->name ?? 'N/A',
                    'email' => $estudiante->email ?? $estudiante->user->email ?? 'N/A',
                    'sede_name' => $estudiante->user->sede->name ?? 'Sin sede',
                    'sede_description' => $estudiante->user->sede->description ?? 'Sin sede',
                    'promedio_general' => 0, // TODO: Calcular cuando tengamos las notas
                    'materias' => [], // TODO: Agregar cuando tengamos las materias
                    'status' => 'active',
                    'en_internado' => $enInternado,
                    'estado_internado' => $participante?->estado,
                    'fecha_ingreso' => $participante?->created_at?->format('d/m/Y'),
                ];
            });

        return Inertia::render('fdtc/selection-student', [
            'estudiantes' => $estudiantes,
        ]);
    }

    /**
     * Agregar estudiantes al internado
     */
    public function add(Request $request)
    {
        $request->validate([
            'estudiantes_ids' => 'required|array',
            'estudiantes_ids.*' => 'string|exists:estudiantes,codigo',
        ]);

        DB::beginTransaction();
        
        try {
            $agregados = 0;
            $yaEnInternado = 0;
            $errores = [];

            foreach ($request->estudiantes_ids as $codigo) {
                $estudiante = Estudiante::with('user')->find($codigo);
                if (!$estudiante){
                    $errores[] = "Estudiante con código $codigo no encontrado.";
                    continue;
                }

                $particpanteExistente = InternadoParticipante::where('estudiante_codigo', $codigo)
                    ->whereNull('deleted_at')
                    ->first();  

                if ($particpanteExistente) {
                    $yaEnInternado++;
                    continue;
            }

            $participanteEliminado = InternadoParticipante::where('estudiante_codigo', $codigo)
                ->onlyTrashed()
                ->first();
            if ($participanteEliminado) {
                $participanteEliminado->restore();
                $participanteEliminado->update(['estado' => 'activo']);
                $agregados++;
            }else {
                InternadoParticipante::create([
                    'estudiante_codigo' => $codigo,
                    'estado' => 'activo',
                ]);
                $agregados++;
            }
            }

            DB::commit();

            $mensaje = [];
            if ($agregados > 0) {
                $mensaje[] = "$agregados estudiante(s) agregado(s) correctamente.";
            }
            if ($yaEnInternado > 0) {
                $mensaje[] = "$yaEnInternado estudiante(s) ya estaban en el internado.";
            }
            if (!empty($errores)) {
                $mensaje[] = count($errores) . " error(es) encontrados";
            }

            $mensajes = implode('. ', $mensaje);

            if ($agregados > 0) {
                return redirect()->back()->with('success', $mensajes);
            } else {
                return redirect()->back()->with('error', $mensajes ?: 'No se pudieron agregar estudiantes');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al agregar estudiantes: ' . $e->getMessage());
        }
    }

    /**
     * Exportar estudiantes seleccionados
     */
    public function export(Request $request)
    {
        $request->validate([
            'estudiantes_ids' => 'required|array',
            'estudiantes_ids.*' => 'integer|exists:users,id',
        ]);

        // TODO: Implementar la exportación a Excel/PDF
        
        return redirect()->back()->with('success', 'Exportación iniciada.');
    }

}
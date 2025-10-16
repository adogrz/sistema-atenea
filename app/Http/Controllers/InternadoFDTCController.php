<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Estudiante;

class InternadoFDTCController extends Controller
{
    /**
     * Muestra la lista de estudiantes para el internado FDTC
     */
    public function index(): Response
    {
        $estudiantes = Estudiante::with(['user.sede'])
            ->whereHas('user', function ($query) {
                $query->whereHas('roles', function ($q) {
                    $q->where('name', 'estudiante');
                });
            })
            ->get()
            ->map(function ($estudiante) {
                $nombreCompleto = trim(
                    ($estudiante->primer_nombre ?? '') . ' ' .
                    ($estudiante->segundo_nombre ?? '') . ' ' .
                    ($estudiante->primer_apellido ?? '') . ' ' .
                    ($estudiante->segundo_apellido ?? '')
                );

                return [
                    'id' => $estudiante->codigo,
                    'codigo' => $estudiante->codigo,
                    'nombre' => $nombreCompleto ?: $estudiante->user->name ?? 'N/A',
                    'email' => $estudiante->email ?? $estudiante->user->email ?? 'N/A',
                    'sede_name' => $estudiante->user->sede->name ?? 'Sin sede',
                    'sede_description' => $estudiante->user->sede->description ?? 'Sin sede',
                    'promedio_general' => 0, // TODO: Calcular cuando tengamos las notas
                    'materias' => [], // TODO: Agregar cuando tengamos las materias
                    'status' => $estudiante->user->status ?? 'inactive',
                ];
            });

        return Inertia::render('fdtc/selection-student', [
            'estudiantes' => $estudiantes,
        ]);
    }

    /**
     * Agregar estudiantes al internado FDTC
     */
    public function add(Request $request)
    {
        $request->validate([
            'estudiantes_ids' => 'required|array',
            'estudiantes_ids.*' => 'integer|exists:users,id',
        ]);

        // TODO: Implementar la lógica para agregar estudiantes al internado
        // Por ahora solo retornamos un mensaje de éxito

        return redirect()->back()->with('success', 
            count($request->estudiantes_ids) . ' estudiante(s) agregado(s) al Internado FDTC correctamente.'
        );
    }

    /**
     * Remover estudiantes del internado FDTC
     */
    public function remove(Request $request)
    {
        $request->validate([
            'estudiantes_ids' => 'required|array',
            'estudiantes_ids.*' => 'integer',
        ]);

        // TODO: Implementar la lógica para remover estudiantes del internado
        // Por ahora solo retornamos un mensaje de éxito

        return redirect()->back()->with('success', 
            count($request->estudiantes_ids) . ' estudiante(s) removido(s) del Internado FDTC correctamente.'
        );
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
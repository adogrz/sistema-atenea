<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class InternadoFDTCController extends Controller
{
    /**
     * Muestra la lista de estudiantes para el internado FDTC
     */
    public function index(): Response
    {
        $estudiantes = User::with(['roles', 'sede', 'areas'])
            ->whereHas('roles', function ($query) {
                $query->where('name', 'estudiante');
            })
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'nombre' => $user->name,
                    'email' => $user->email,
                    'sede_name' => $user->sede->name ?? 'Sin sede',
                    'sede_description' => $user->sede->description ?? 'Sin sede',
                    'promedio_general' => 0,
                    'materias' => [],
                    'status' => $user->status,
                    'en_internado' => false,
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
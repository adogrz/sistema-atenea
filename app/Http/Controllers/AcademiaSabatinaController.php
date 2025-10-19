<?php

namespace App\Http\Controllers;

use App\Models\Mes;
use App\Models\Evaluacion;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Inertia\Inertia;

class AcademiaSabatinaController extends Controller
{
    public function getMeses(){
        $meses = Mes::all();
        return response()->json($meses);
    }
    public function getEvaluacionesPorMes($idMes){
        $evaluaciones = Evaluacion::where('idMes', $idMes)->get();
        return response()->json($evaluaciones);
    }
    public function crearEvaluacion(Request $request){
        $request->validate([
            'nombre' => 'required|string|max:30',
            'creditoExtra' => 'required|boolean',
            'porcentaje' => 'required|numeric|min:0|max:100',
            'idMes' => 'required|exists:mes,idMes',
        ]);

        $evaluacion = Evaluacion::create([
            'nombre' => $request->nombre,
            'creditoExtra' => $request->creditoExtra,
            'porcentaje' => $request->porcentaje,
            'idMes' => $request->idMes,
        ]);

        return response()->json($evaluacion, 201);
    }
    public function getPlanificacion()
    {
        $user = Auth::user();
        $meses = Mes::where('idNivelEducativo', $user->idNivelEducativo)->get();
        $mesesIds = $meses->pluck('idMes');
        
        $evaluaciones = Evaluacion::whereIn('idMes', $mesesIds)
                                  ->with('mes')
                                  ->get();

        return Inertia::render('planificacion', [
            'meses' => $meses,
            'evaluaciones' => $evaluaciones,
        ]);
    }
}

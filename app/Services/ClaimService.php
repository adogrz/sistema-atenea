<?php

namespace App\Services;

use App\Models\ClaimCalificacion;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

class ClaimService
{
    public function claim(int $evaluacionFaseId, int $inscripcionId, int $calificadorId): ClaimCalificacion
    {
        return DB::transaction(function () use ($evaluacionFaseId, $inscripcionId, $calificadorId) {
            // Cierra claims previos del usuario para esa inscripción/evaluación
            ClaimCalificacion::where([
                'evaluacion_fase_id' => $evaluacionFaseId,
                'inscripcion_id'     => $inscripcionId,
                'calificador_id'     => $calificadorId,
                'activo'             => true,
            ])->update([
                'activo'      => false,
                'liberado_en' => Carbon::now(),
            ]);
            // Crea nuevo claim activo (único)
            return ClaimCalificacion::create([
                'evaluacion_fase_id' => $evaluacionFaseId,
                'inscripcion_id'     => $inscripcionId,
                'calificador_id'     => $calificadorId,
                'tomado_en'          => Carbon::now(),
                'activo'             => true,
            ]);
        });
    }

    public function release(int $evaluacionFaseId, int $inscripcionId, int $calificadorId): bool
    {
        return DB::transaction(function () use ($evaluacionFaseId, $inscripcionId, $calificadorId) {
            $updated = ClaimCalificacion::where([
                'evaluacion_fase_id' => $evaluacionFaseId,
                'inscripcion_id'     => $inscripcionId,
                'calificador_id'     => $calificadorId,
                'activo'             => true,
            ])->update([
                'activo'      => false,
                'liberado_en' => Carbon::now(),
            ]);
            return (bool)$updated;
        });
    }

    public function tieneClaimActivo(int $evaluacionFaseId, int $calificadorId): bool
    {
        return ClaimCalificacion::where([
            'evaluacion_fase_id' => $evaluacionFaseId,
            'calificador_id'     => $calificadorId,
            'activo'             => true,
        ])->exists();
    }
}

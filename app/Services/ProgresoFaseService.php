<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ProgresoFasesService
{
    /**
     * Regla: puede inscribirse a $faseId si:
     *  - Es la primera fase (orden = 1), o
     *  - La fase anterior de la MISMA olimpiada está finalizada y aprobada para su inscripcion_id.
     *
     * @param  string $estudianteCodigo  Código del estudiante (columna en inscripciones_olimpiadas)
     * @param  int    $faseId            ID en fases_olimpiadas
     */
    public function puedeInscribirseAFasePorCodigo(string $estudianteCodigo, int $faseId): bool
    {
        // Obtenemos olimpiada y orden de la fase destino
        $fase = DB::table('fases_olimpiadas')
            ->select('id', 'olimpiada_id', 'orden')
            ->where('id', $faseId)
            ->first();

        if (!$fase) return false;
        if ((int)$fase->orden === 1) return true;

        // Localizamos la fase anterior (misma olimpiada, orden - 1)
        $faseAnterior = DB::table('fases_olimpiadas')
            ->select('id')
            ->where('olimpiada_id', $fase->olimpiada_id)
            ->where('orden', (int)$fase->orden - 1)
            ->first();

        if (!$faseAnterior) return false;

        // Localizamos la inscripcion del estudiante para esta olimpiada
        $inscripcion = DB::table('inscripciones_olimpiadas')
            ->select('id')
            ->where('olimpiada_id', $fase->olimpiada_id)
            ->where('estudiante_codigo', $estudianteCodigo)
            ->first();

        if (!$inscripcion) return false;

        // Verificamos evaluación finalizada y aprobada en la fase anterior
        $aprobada = DB::table('evaluaciones_fase')
            ->where('inscripcion_id', $inscripcion->id)
            ->where('fase_olimpiada_id', $faseAnterior->id)
            ->where('finalizada', 1)
            ->where('aprobada', 1)
            ->exists();

        return $aprobada;
    }
}

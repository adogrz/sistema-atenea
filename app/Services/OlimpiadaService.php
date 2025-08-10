<?php

namespace App\Services;

use App\Models\FaseOlimpiada;
use App\Models\InscripcionOlimpiada;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;

class OlimpiadaService
{
    /**
     * Retorna las fases vigentes agrupadas por olimpiada
     */
    public function fasesVigentesAgrupadas(): Collection
    {
        $hoy = Carbon::today();

        return FaseOlimpiada::with('olimpiada')
            ->where('activa', true)
            //->whereDate('fecha_inicio', '<=', $hoy)
            //->whereDate('fecha_fin', '>=', $hoy)
            ->orderBy('olimpiada_id')
            ->orderBy('numero_fase')
            ->get()
            ->groupBy('olimpiada_id');
    }

    /**
     * Retorna las inscripciones del estudiante agrupadas por olimpiada
     */
    public function inscripcionesPorEstudiante(string $codigoEstudiante): Collection
    {
        return InscripcionOlimpiada::with('fase')
            ->porEstudiante($codigoEstudiante)
            ->get()
            ->groupBy(fn($insc) => $insc->fase->olimpiada_id);
    }

    /**
     * Determina si el estudiante puede inscribirse en la primera fase vigente de cada olimpiada
     */
    public function puedeInscribirse(Collection $fasesVigentes, Collection $inscripciones): Collection
    {
        return $fasesVigentes->mapWithKeys(function ($fases, $olimpiadaId) use ($inscripciones) {
            $primeraFase = $fases->first();
            $yaInscrito = $inscripciones->get($olimpiadaId)?->contains('fase_id', $primeraFase->id) ?? false;
            return [$olimpiadaId => !$yaInscrito];
        });
    }
}
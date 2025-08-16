<?php

namespace App\Services;

use App\Models\FaseOlimpiada;
use App\Models\InscripcionOlimpiada;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class OlimpiadaService
{
    /**
     * Retorna las fases (vigentes o no) agrupadas por olimpiada.
     *
     * @param  bool        $aplicarVentanaFechas   Si true, filtra por fecha_inicio/fecha_fin y activa=1
     * @param  Carbon|null $fechaReferencia        Día de referencia (por defecto today())
     * @param  bool        $usarCache              Si true, cachea el resultado (TTL corto)
     * @param  int         $ttlSegundos            TTL del cache
     * @return Collection<int, \Illuminate\Support\Collection>  [olimpiada_id => Collection<FaseOlimpiada>]
     */
    public function fasesVigentesAgrupadas(
        bool $aplicarVentanaFechas = true,
        ?Carbon $fechaReferencia = null,
        bool $usarCache = false,
        int $ttlSegundos = 300
    ): Collection {
        $fecha = $fechaReferencia?->copy()->startOfDay() ?? Carbon::today();

        if ($usarCache) {
            $key = sprintf('fases_vigentes_%s_%d', $fecha->toDateString(), $aplicarVentanaFechas ? 1 : 0);
            return Cache::remember($key, $ttlSegundos, fn() => $this->buildFasesAgrupadas($aplicarVentanaFechas, $fecha));
        }

        return $this->buildFasesAgrupadas($aplicarVentanaFechas, $fecha);
    }

    /**
     * Retorna las inscripciones del estudiante agrupadas por olimpiada.
     *
     * @return Collection<int, \Illuminate\Support\Collection>  [olimpiada_id => Collection<InscripcionOlimpiada>]
     */
    public function inscripcionesPorEstudiante(string $codigoEstudiante): Collection
    {
        // Eager mínimo: sólo lo necesario para agrupar
        $inscripciones = InscripcionOlimpiada::with([
            'fase:id,olimpiada_id,numero_fase,area_academica'
            ])
            ->porEstudiante($codigoEstudiante)   // mantiene tu scope
            ->get();

        // Agrupa por la olimpiada de la fase
        return $inscripciones->groupBy(fn(InscripcionOlimpiada $i) => $i->fase->olimpiada_id);
    }

    /**
     * Determina si el estudiante puede inscribirse en la PRIMERA fase (por numero_fase) de cada olimpiada.
     *
     * @param  Collection $fasesVigentes    [olimpiada_id => Collection<FaseOlimpiada>]
     * @param  Collection $inscripciones    [olimpiada_id => Collection<InscripcionOlimpiada>]
     * @return Collection<int, bool>        [olimpiada_id => bool]
     */
    public function puedeInscribirse(Collection $fasesVigentes, Collection $inscripciones): Collection
    {
        return $fasesVigentes->mapWithKeys(function (Collection $fases, int|string $olimpiadaId) use ($inscripciones) {
            if ($fases->isEmpty()) {
                return [$olimpiadaId => false];
            }

            // Asegura orden estable por numero_fase
            $primeraFase = $fases->sortBy('numero_fase')->first();
            $delEstudiante = $inscripciones->get($olimpiadaId);

            $yaInscritoEnPrimera = $delEstudiante?->contains(fn($insc) => (int)$insc->fase_id === (int)$primeraFase->id) ?? false;

            return [$olimpiadaId => !$yaInscritoEnPrimera];
        });
    }

    /* =======================
     * Helpers privados
     * =======================
     */

    /**
     * Construye el dataset base de fases (con/sin ventana fechas) agrupadas por olimpiada.
     *
     * @return Collection<int, \Illuminate\Support\Collection>
     */
    private function buildFasesAgrupadas(bool $aplicarVentanaFechas, Carbon $fecha): Collection
    {
        $q = FaseOlimpiada::query()
            ->with('olimpiada:id,nombre,area_academica')
            ->orderBy('olimpiada_id')
            ->orderBy('numero_fase');

        if ($aplicarVentanaFechas) {
            $q->where('activa', true)
                ->whereDate('fecha_inicio', '<=', $fecha)
                ->whereDate('fecha_fin', '>=', $fecha);
        }

        return $q->get()->groupBy('olimpiada_id');
    }
}

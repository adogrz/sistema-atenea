<?php

namespace App\Services;

use App\Models\FaseOlimpiada;
use App\Models\InscripcionOlimpiada;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Servicio de lógica para fases e inscripciones a olimpiadas.
 *
 * Métodos clave:
 *  - fasesVigentesAgrupadas(): agrupa fases activas por olimpiada
 *  - inscripcionesPorEstudiante(): agrupa inscripciones por olimpiada
 *  - puedeInscribirse(): determina si un estudiante puede inscribirse a una olimpiada
 */
class OlimpiadaService
{
    /**
     * Retorna las fases agrupadas por olimpiada (vigentes o no).
     *
     * @param  bool        $aplicarVentanaFechas   Si true, filtra por fecha_inicio/fin y activa
     * @param  Carbon|null $fechaReferencia        Día de referencia (default: today)
     * @param  bool        $usarCache              Si true, cachea el resultado
     * @param  int         $ttlSegundos            Duración del cache (en segundos)
     * @return Collection<int, Collection<FaseOlimpiada>> [olimpiada_id => fases]
     */
    public function fasesVigentesAgrupadas(
        ?int $nivelEducativoId = null,
        bool $aplicarVentanaFechas = true,
        ?Carbon $fechaReferencia = null,
        bool $usarCache = false,
        int $ttlSegundos = 300
    ): Collection {
        $fecha = $fechaReferencia?->copy()->startOfDay() ?? Carbon::today();

        if ($usarCache) {
            $key = sprintf('fases_vigentes_%s_%d_%d', $fecha->toDateString(), $aplicarVentanaFechas ? 1 : 0, $nivelEducativoId ?? 0);
            return Cache::remember($key, $ttlSegundos, fn() => $this->buildFasesAgrupadas($aplicarVentanaFechas, $fecha, $nivelEducativoId));
        }

        return $this->buildFasesAgrupadas($aplicarVentanaFechas, $fecha, $nivelEducativoId);
    }

    /**
     * Retorna las inscripciones del estudiante agrupadas por olimpiada.
     *
     * @param  string $codigoEstudiante
     * @return Collection<int, Collection<InscripcionOlimpiada>> [olimpiada_id => inscripciones]
     */
    public function inscripcionesPorEstudiante(string $codigoEstudiante): Collection
    {
        return InscripcionOlimpiada::with([
            'estado:id,nombre,slug,es_final',
            'olimpiada:id,nombre,area_id',
            'olimpiada.area:id,name,description',
        ])
            ->deEstudiante($codigoEstudiante)
            ->get()
            ->groupBy('olimpiada_id');
    }

    /**
     * Determina si el estudiante puede inscribirse a cada olimpiada.
     *
     * Regla: puede inscribirse si NO tiene ya una inscripción (activa o no) para esa olimpiada.
     *
     * @param  Collection<int, Collection<FaseOlimpiada>> $fasesVigentes
     * @param  Collection<int, Collection<InscripcionOlimpiada>> $inscripciones
     * @return Collection<int, bool>  [olimpiada_id => bool]
     */
    public function puedeInscribirse(Collection $fasesVigentes, Collection $inscripciones): Collection
    {
        return $fasesVigentes->mapWithKeys(function (Collection $fases, int|string $olimpiadaId) use ($inscripciones) {
            if ($fases->isEmpty()) {
                return [(int) $olimpiadaId => false];
            }

            $yaInscrito = $inscripciones->has((int) $olimpiadaId);

            return [(int) $olimpiadaId => !$yaInscrito];
        });
    }

    /* =======================
     * Helpers internos
     * ======================= */

    /**
     * Agrupa las fases por olimpiada, filtrando si se requiere.
     *
     * @return Collection<int, Collection<FaseOlimpiada>>
     */
    private function buildFasesAgrupadas(bool $aplicarVentanaFechas, Carbon $fecha, ?int $nivelEducativoId): Collection
    {
        $q = FaseOlimpiada::query()
            ->with([
                'olimpiada:id,nombre,area_id,nivel_educativo_id',
                'olimpiada.area:id,name,description',
                'olimpiada.nivelEducativo:codigo,descripcion',
            ])
            ->orderBy('olimpiada_id')
            ->orderBy('orden');

        if ($aplicarVentanaFechas) {
            $q->where('activa', true)
                ->whereDate('fecha_inicio', '<=', $fecha)
                ->whereDate('fecha_fin', '>=', $fecha);
        }

        if ($nivelEducativoId) {
            $q->whereHas('olimpiada', function ($query) use ($nivelEducativoId) {
                $query->where('nivel_educativo_id', $nivelEducativoId);
            });
        }

        return $q->get()->groupBy('olimpiada_id');
    }
}

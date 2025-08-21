<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class InscripcionOlimpiada extends Model
{
    protected $table = 'inscripciones_olimpiadas';

    protected $fillable = [
        'olimpiada_id',
        'fase_id',
        'estudiante_codigo',
        'estado_inscripcion_id',
        'fecha_inscripcion',
    ];

    /**
     * Relación con los modelos.
     */

    public function participante()
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_codigo', 'codigo');
    }

    public function estado()
    {
        return $this->belongsTo(EstadoInscripcion::class, 'estado_inscripcion_id');
    }

    public function evaluacionesFase()
    {
        return $this->hasMany(EvaluacionFase::class, 'inscripcion_id');
    }

    public function bitacoras()
    {
        return $this->hasMany(BitacoraInscripcion::class, 'inscripcion_id');
    }

    public function scopeDeEstudiante($query, $estudianteId)
    {
        return $query->where('estudiante_codigo', $estudianteId);
    }

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_codigo', 'codigo');
    }
    public function evaluaciones()
    {
        return $this->hasMany(EvaluacionFase::class, 'inscripcion_id');
    }

    /**
     * Limita por áreas del calificador (vía olimpiada) y, opcionalmente, por una olimpiada específica.
     */
    public function scopeAccesiblesPorAreas(Builder $q, $areaIds, ?int $olimpiadaId = null): Builder
    {
        $ids = collect($areaIds)->filter()->values();
        return $q->whereHas('olimpiada', function (Builder $qq) use ($ids, $olimpiadaId) {
            $qq->whereIn('area_id', $ids);
            if ($olimpiadaId) $qq->where('id', $olimpiadaId);
        });
    }

    /**
     * Excluye inscripciones con claim activo de otro calificador.
     */
    public function scopeSinClaimDeOtros(Builder $q, int $userId, ?Carbon $now = null): Builder
    {
        $now ??= now();
        return $q->whereNotExists(function ($sub) use ($userId, $now) {
            $sub->select(DB::raw(1))
                ->from('claims_calificacion as c')
                ->whereColumn('c.inscripcion_id', 'inscripciones_olimpiadas.id')
                ->where('c.calificador_id', '<>', $userId)
                ->where('c.locked_until', '>', $now);
        });
    }

    /**
     * Si se filtra por una fase específica, excluye inscripciones que ya tengan esa fase en proceso por otro.
     */
    public function scopeSinFaseEnProcesoDeOtro(Builder $q, int $faseId, int $userId): Builder
    {
        return $q->whereDoesntHave('evaluaciones', function (Builder $qq) use ($faseId, $userId) {
            $qq->where('fase_olimpiada_id', $faseId)
                ->where('estado', 'en_proceso')
                ->where('calificador_id', '<>', $userId);
        });
    }

    /**
     * Composición práctica para “disponibles” del dashboard.
     */
    public function scopeDisponiblesPara(
        Builder $q,
        $areaIds,
        int $userId,
        ?int $olimpiadaId = null,
        ?int $faseId = null
    ): Builder {
        $q->accesiblesPorAreas($areaIds, $olimpiadaId)
            ->sinClaimDeOtros($userId);

        if ($faseId) {
            $q->sinFaseEnProcesoDeOtro($faseId, $userId);
        }

        return $q;
    }
}

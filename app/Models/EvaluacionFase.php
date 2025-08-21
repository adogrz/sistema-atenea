<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluacionFase extends Model
{
    protected $table = 'evaluaciones_fase';

    protected $fillable = [
        'inscripcion_id',
        'fase_olimpiada_id',
        'calificador_id',
        'calificacion',
        'comentarios',
        'fecha_evaluacion',
        'estado_evaluacion_id',
    ];

    /* ========================
     |  Relaciones
     ========================*/

    public function calificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calificador_id');
    }

    public function itemsEvaluados(): HasMany
    {
        return $this->hasMany(ItemEvaluado::class, 'evaluacion_fase_id');
    }

    public function inscripcion()
    {
        return $this->belongsTo(InscripcionOlimpiada::class, 'inscripcion_id');
    }
    public function fase()
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_olimpiada_id');
    }

    /** Del calificador dado */
    public function scopeDelCalificador(Builder $q, int $userId): Builder
    {
        return $q->where('calificador_id', $userId);
    }

    /** Con estado exacto (en_proceso | finalizado) */
    public function scopeEstado(Builder $q, string $estado): Builder
    {
        return $q->where('estado', $estado);
    }

    /** Filtros por áreas/olimpiada/fase (vía inscripción -> olimpiada y por campo fase_olimpiada_id) */
    public function scopeAccesiblesPorAreas(
        Builder $q,
        $areaIds,
        ?int $olimpiadaId = null,
        ?int $faseId = null
    ): Builder {
        $ids = collect($areaIds)->filter()->values();

        $q->whereHas('inscripcion.olimpiada', function (Builder $qq) use ($ids, $olimpiadaId) {
            $qq->whereIn('area_id', $ids);
            if ($olimpiadaId) $qq->where('id', $olimpiadaId);
        });

        if ($faseId) {
            $q->where('fase_olimpiada_id', $faseId);
        }

        return $q;
    }

    /** Carga mínima para el dashboard (fase + estudiante) */
    public function scopeWithResumen(Builder $q): Builder
    {
        return $q->with([
            'fase:id,nombre',
            'inscripcion:id,olimpiada_id,estudiante_codigo',
            'inscripcion.estudiante:codigo,nombre,apellido',
        ]);
    }
}

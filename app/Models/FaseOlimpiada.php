<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class FaseOlimpiada extends Model
{
    use LogsActivity;



    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'fases_olimpiadas';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'olimpiada_id',
        'nombre',
        'descripcion',
        'definicion_evaluacion_id',
        'cupos',
        'nota_minima_aprobacion',
        'fecha_inicio',
        'fecha_fin',
        'resultados_publicados',
        'orden',
        'observaciones',
    ];

    /**
     * Relación: pertenece a una definicion de evaluacion
     */
    public function definicionEvaluacion(): BelongsTo
    {
        return $this->belongsTo(DefinicionEvaluacion::class, 'definicion_evaluacion_id');
    }

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'activa' => 'boolean',
        'cupos' => 'integer',
        'nota_minima_aprobacion' => 'float',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'resultados_publicados' => 'boolean',
    ];

    /**
     * Relación: pertenece a una olimpiada
     */
    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'olimpiada_id');
    }

    /**
     * Relación: tiene muchas evaluaciones, que representan los participantes en esta fase.
     */
    public function evaluaciones(): HasMany
    {
        return $this->hasMany(Evaluacion::class, 'fase_olimpiada_id');
    }

    /**
     * Verifica si la inscripción está abierta.
     */
    public function isInscripcionAbierta(): bool
    {
        $now = Carbon::now();
        return $this->fecha_inicio_inscripcion <= $now && $now <= $this->fecha_fin_inscripcion;
    }

    /**
     * Scope para fases activas.
     */
    public function scopeActivas(Builder $query): Builder
    {
        return $query->where('activa', true);
    }

    /**
     * Get the options for activity logging.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

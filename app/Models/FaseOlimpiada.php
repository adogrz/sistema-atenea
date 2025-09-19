<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FaseOlimpiada extends Model
{
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
        'fecha_inicio_inscripcion',
        'fecha_fin_inscripcion',
        'resultados_publicados',
        'orden',
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
        'fecha_inicio_inscripcion' => 'datetime',
        'fecha_fin_inscripcion' => 'datetime',
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

    

    public function itemsDefinidos(): HasMany
    {
        return $this->hasMany(ItemDefinido::class, 'fase_olimpiada_id');
    }
}

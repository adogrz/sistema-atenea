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
        'numero_fase',
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'activa',
        'descripcion',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'activa' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    /**
     * Relación: pertenece a una olimpiada
     */
    public function olimpiada(): BelongsTo
    {
        return $this->belongsTo(Olimpiada::class);
    }

    /**
     * Relación: tiene muchas inscripciones
     */
    public function inscripciones(): HasMany
    {
        return $this->hasMany(InscripcionOlimpiada::class, 'fase_id');
    }

    /**
     * Scope: fases vigentes (activas y dentro del rango de fechas)
     */
    public function scopeVigentes(Builder $query): Builder
    {
        $hoy = Carbon::today();

        return $query->where('activa', true)
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_fin', '>=', $hoy);
    }
}

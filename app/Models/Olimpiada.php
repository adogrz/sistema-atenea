<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Olimpiada extends Model
{
    use LogsActivity;

    protected $table = 'olimpiadas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'area_id', // Relación con el área académica
        'activa',
        'nivel_educativo_id',
    ];

    protected $casts = [
        'activa' => 'boolean',
    ];

    public function nivelEducativo(): BelongsTo
    {
        return $this->belongsTo(NivelEducativo::class, 'nivel_educativo_id', 'codigo');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function fases(): HasMany
    {
        return $this->hasMany(FaseOlimpiada::class);
    }

    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }

    public function scopePorArea($query, $area)
    {
        return $query->where('area_id', $area);
    }

    public function inscripciones(): HasMany
    {
        return $this->hasMany(InscripcionOlimpiada::class, 'olimpiada_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}

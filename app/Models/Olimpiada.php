<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Olimpiada extends Model
{
    protected $table = 'olimpiadas';

    protected $fillable = [
        'nombre',
        'descripcion',
        'area_id', // Relación con el área académica
        'activa',
    ];

    protected $casts = [
        'activa' => 'boolean',
    ];

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
}

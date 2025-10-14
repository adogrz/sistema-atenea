<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Olimpiada extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'area_academica',
        'activa',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'activa' => 'boolean',
    ];

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
        return $query->where('area_academica', $area);
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }
}

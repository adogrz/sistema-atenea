<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class InscripcionOlimpiada extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'inscripciones_olimpiadas';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'fase_id',
        'codigo_estudiante',
        'fecha_inscripcion',
    ];

    /*
     * Relación con el modelo FaseOlimpiada
     */
    public function fase()
    {
        return $this->belongsTo(FaseOlimpiada::class);
    }

    /**
     * Relación con el modelo Estudiante
     */
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'codigo_estudiante');
    }

    /**
     * Scope para filtrar inscripciones aprobadas
     */
    public function scopeAprobadas($query)
    {
        return $query->where('estado', 'aprobada');
    }

    /**
     * Scope para filtrar inscripciones activas
     */
    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }

    /**
     * Scope para filtrar inscripciones por estudiante
     */
    public function scopePorEstudiante(Builder $query, string $codigoEstudiante): Builder
    {
        return $query->where('codigo_estudiante', $codigoEstudiante);
    }
}
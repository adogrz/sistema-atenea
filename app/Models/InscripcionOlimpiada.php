<?php

namespace App\Models;

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
        'codigo_estudiante', // 'codigo_estudiante'
        'fecha_inscripcion',
        'estado',
        'activa',
        'observaciones',
    ];

    public function fase()
    {
        return $this->belongsTo(FaseOlimpiada::class);
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'codigo_estudiante');
    }

    // Scopes
    public function scopeAprobadas($query)
    {
        return $query->where('estado', 'aprobada');
    }

    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }
}
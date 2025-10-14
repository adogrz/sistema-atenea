<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscripcionOlimpiada extends Model
{
    protected $table = 'inscripciones_olimpiadas';
    protected $fillable = [
        'olimpiada_id', 'fase_id', 'estudiante_codigo', 'estado_inscripcion_id',
        'codigo', 'fecha_inscripcion', 'activo', 'observaciones'
    ];

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'olimpiada_id');
    }

    public function fase()
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_id');
    }

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
}
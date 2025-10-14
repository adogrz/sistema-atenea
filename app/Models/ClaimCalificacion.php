<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClaimCalificacion extends Model
{
    protected $table = 'claim_calificaciones';
    protected $fillable = [
        'evaluacion_fase_id', 'inscripcion_id', 'calificador_id',
        'activo', 'tomado_en', 'liberado_en'
    ];
}

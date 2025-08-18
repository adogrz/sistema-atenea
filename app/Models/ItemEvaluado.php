<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemEvaluado extends Model
{
    protected $table = 'items_evaluados';
    protected $fillable = [
        'evaluacion_fase_id', 'item_definido_id', 'puntaje', 'observacion',
        'calificado_por', 'calificado_en'
    ];

    public function evaluacionFase()
    {
        return $this->belongsTo(EvaluacionFase::class, 'evaluacion_fase_id');
    }

    public function itemDefinido()
    {
        return $this->belongsTo(ItemDefinido::class, 'item_definido_id');
    }
}

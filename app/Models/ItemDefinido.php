<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemDefinido extends Model
{
    protected $table = 'items_definidos';
    protected $fillable = [
        'definicion_id', 'fase_olimpiada_id', 'nombre', 'descripcion',
        'orden', 'obligatorio', 'ponderacion', 'max_puntos'
    ];

    public function definicion()
    {
        return $this->belongsTo(DefinicionEvaluacion::class, 'definicion_id');
    }

    public function fase()
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_olimpiada_id');
    }
}

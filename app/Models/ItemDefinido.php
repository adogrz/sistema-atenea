<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemDefinido extends Model
{
    protected $table = 'items_definidos';
    protected $fillable = [
        'definicion_evaluacion_id', 'nombre', 'descripcion',
        'orden', 'puntos_maximos'
    ];

    public function definicion()
    {
        return $this->belongsTo(DefinicionEvaluacion::class, 'definicion_evaluacion_id');
    }

    public function calificadores()
    {
        return $this->belongsToMany(User::class, 'calificador_item_asignado', 'item_definido_id', 'calificador_id');
    }
}

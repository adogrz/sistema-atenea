<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DefinicionEvaluacion extends Model
{
    protected $table = 'definiciones_evaluacion';
    protected $fillable = ['nombre', 'descripcion', 'version', 'creada_por', 'estado', 'bloqueada'];

    public function itemsDefinidos()
        {
            return $this->hasMany(ItemDefinido::class, 'definicion_evaluacion_id');
        }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Olimpiada extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'olimpiadas';


    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'area_academica',
        'activa',
    ];
}

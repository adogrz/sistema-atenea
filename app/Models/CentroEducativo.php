<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentroEducativo extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'centros_educativos';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'codigo',
        'nombre',
        'departamento',
        'distrito',
        'sector',
        'zona',
        'direccion',
        'internacional',
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentroEducativo extends Model
{
    protected $table = 'centros_educativos';

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

    // Este modelo está diseñado solo para consultas y mantenimiento de catálogo.
}
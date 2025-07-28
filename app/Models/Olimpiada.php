<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Olimpiada extends Model
{

    protected $table = 'olimpiadas'; // Explicitly define table name if it's not the plural of the model name

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'grado_min',
        'grado_max',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];
}

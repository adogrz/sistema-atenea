<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
    protected $fillable = [
        'clasificacion',
        'descripcion',
        'fecha_inicio',
        'hora_inicio',
        'fecha_fin',
        'hora_fin',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',

    ];

    //Definición de los tipos como constantes
    public const CLASIFICACION_REGISTRO = 'registro';

    public static function getClasificaciones(): array
    {
        return [
            self::CLASIFICACION_REGISTRO,
        ];
    }

}

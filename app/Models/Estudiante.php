<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Estudiante extends Model
{
    protected $fillable = [
        'codigo',
        'user_id',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'sexo',
        'fecha_nacimiento',
        'centro_educativo',
        'nie',
        'telefono_estudiante',
        'telefono_casa',
        'email',
        'direccion',
        'distrito',
        'nivel_educativo',
    ];

    public function responsable(): HasOne
    {
        return $this->hasOne(Responsable::class, 'codigo_estudiante', 'codigo');
    }
}
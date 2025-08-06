<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Estudiante extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'estudiantes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
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
        'aprobado',
    ];

    public function responsable(): HasOne
    {
        return $this->hasOne(Responsable::class, 'codigo_estudiante', 'codigo');
    }
}
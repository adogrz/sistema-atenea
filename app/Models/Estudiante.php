<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Estudiante extends Model
{
    use HasFactory;
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

    public function centro_educativo(): HasOne
    {
        return $this->hasOne(CentroEducativo::class, 'centro_educativo', 'codigo');
    }

    public function nivel_educativo(): HasOne
    {
        return $this->hasOne(NivelEducativo::class, 'nivel_educativo', 'codigo');
    }

    public function distrito(): HasOne
    {
        return $this->hasOne(Distrito::class, 'distrito', 'id');
    }
}
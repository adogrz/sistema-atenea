<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Estudiante extends Model
{
    protected $primaryKey = 'codigo';
    public $incrementing = false;
    protected $keyType = 'string';

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
        'direccion_id',
        'nivel_educativo',
    ];

    public function responsable(): HasOne
    {
        return $this->hasOne(Responsable::class, 'codigo_estudiante', 'codigo');
    }

    /**
     * Relación con la dirección normalizada
     */
    public function direccion(): BelongsTo
    {
        return $this->belongsTo(Direccion::class, 'direccion_id');
    }

    /**
     * Obtener la dirección completa formateada
     */
    public function getDireccionCompleta(): string
    {
        return $this->direccion?->getDireccionFormateadaAttribute() ?? 'Sin dirección';
    }
}

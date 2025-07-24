<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Responsable extends Model
{
    protected $fillable = [
        'dui',
        'codigo_estudiante',
        'nombres_responsable',
        'apellidos_responsable',
        'email_responsable',
        'telefono_responsable',
        'telefono_opcional',
        'tipo_parentesco',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'codigo_estudiante', 'codigo');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoInscripcion extends Model
{
    protected $table = 'estados_inscripciones';

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $casts = [
        'es_final' => 'boolean',
        'activo'   => 'boolean',
    ];

    /**
     * Relación: un estado tiene muchas inscripciones.
     */
    public function inscripciones(): HasMany
    {
        return $this->hasMany(InscripcionOlimpiada::class, 'estado_id');
    }

    /* Scopes útiles */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeFinales($query)
    {
        return $query->where('es_final', true);
    }
}
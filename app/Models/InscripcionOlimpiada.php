<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InscripcionOlimpiada extends Model
{
    // Columna deleted_at
    use SoftDeletes;

    protected $table = 'inscripciones_olimpiadas';

    // Protegemos claves y timestamps (incluye deleted_at si usas SoftDeletes)
    protected $guarded = ['id', 'created_at', 'updated_at', 'deleted_at'];

    // Ajusta estos casts a tus columnas reales
    protected $casts = [
        'fecha_inscripcion' => 'datetime',
        'activa'            => 'boolean',
    ];

    /* ========================
     |  Relaciones
     |======================== */
    public function fase(): BelongsTo
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_id');
    }

    // Usas 'participante' en tu controlador para el estudiante
    public function participante(): BelongsTo
    {
        // clave local: codigo_estudiante; clave del otro lado: codigo
        return $this->belongsTo(Estudiante::class, 'codigo_estudiante', 'codigo');
    }

    // Alias opcional si prefieres acceder como $inscripcion->estudiante
    public function estudiante(): BelongsTo
    {
        return $this->participante();
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(EstadoInscripcion::class, 'estado_id');
    }

    public function bitacoras(): HasMany
    {
        return $this->hasMany(BitacoraInscripcion::class, 'inscripcion_id');
    }

    /* ========================
     |  Scopes
     |======================== */

    public function scopeActivas($query)
    {
        return $query->whereNull('deleted_at'); // Solo inscripciones activas
    }

    public function scopePorEstudiante(Builder $query, string $codigo)
    {
        return $query->where('codigo_estudiante', $codigo);
    }

    public function scopeDeEstudiante($query, string $codigo)
    {
        return $query->where('codigo_estudiante', $codigo);
    }
}
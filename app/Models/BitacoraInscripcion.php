<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BitacoraInscripcion extends Model
{
    protected $table = 'bitacora_inscripciones';

    // Protegemos claves y timestamps
    protected $guarded = ['id', 'created_at', 'updated_at'];

    // Constantes para evitar "string literals" en el código
    public const ACCION_INSCRIPCION     = 'inscripcion';
    public const ACCION_DESINSCRIPCION  = 'desinscripcion';

    protected $casts = [
        'accion' => 'string',
    ];

    /** Relación: esta bitácora pertenece a una inscripción */
    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(InscripcionOlimpiada::class, 'inscripcion_id');
    }

    /** Relación: usuario responsable (puede ser null) */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /** Relación: esta bitácora pertenece a un estudiante */
    public function estudiante(): HasOne
    {
        return $this->hasOne(Estudiante::class, 'id', 'user_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OlimpiadaAprobacionFinal extends Model
{
    protected $table = 'olimpiada_aprobaciones_finales';

    protected $fillable = [
        'estudiante_codigo',
        'olimpiada_id',
        'fase_id',
        'grupo_id',
        'fecha_aprobacion',
        'estado_aceptacion',
    ];

    protected $casts = [
        'fecha_aprobacion' => 'datetime',
        'estado_aceptacion' => 'string',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_codigo', 'codigo');
    }

    public function olimpiada(): BelongsTo
    {
        return $this->belongsTo(Olimpiada::class);
    }

    public function fase(): BelongsTo
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_id');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }
}

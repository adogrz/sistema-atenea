<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternadoCalificacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'internado_calificaciones';

    protected $fillable = [
        'evaluacion_id',
        'participante_id',
        'nota',
        'observaciones',
    ];

    protected $casts = [
        'nota' => 'decimal:1',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relación con evaluación
     */
    public function evaluacion(): BelongsTo
    {
        return $this->belongsTo(InternadoEvaluacion::class, 'evaluacion_id');
    }

    /**
     * Relación con participante
     */
    public function participante(): BelongsTo
    {
        return $this->belongsTo(InternadoParticipante::class, 'participante_id');
    }

    /**
     * Obtener calificación ponderada
     */
    public function getNotaPonderadaAttribute(): float
    {
        if (is_null($this->nota)) {
            return 0.0;
        }
        
        $evaluacion = $this->evaluacion;
        if (!$evaluacion) {
            return 0.0;
        }

        // (nota / nota_maxima) * peso_porcentual
        return ($this->nota / $evaluacion->nota_maxima) * ($evaluacion->peso_porcentual / 100);
    }

    /**
     * Scope para calificaciones con nota asignada
     */
    public function scopeCalificadas($query)
    {
        return $query->whereNotNull('nota');
    }

}
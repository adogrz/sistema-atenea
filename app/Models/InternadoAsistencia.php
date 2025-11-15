<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternadoAsistencia extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'internado_asistencias';

    protected $fillable = [
        'participante_id',
        'periodo_id',
        'nivel_codigo',
        'fecha',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public const ESTADOS = ['presente', 'ausente', 'justificada'];

    /**
     * Relación con participante
     */
    public function participante(): BelongsTo
    {
        return $this->belongsTo(InternadoParticipante::class, 'participante_id');
    }

    /**
     * Relación con periodo
     */
    public function periodo(): BelongsTo
    {
        return $this->belongsTo(InternadoPeriodo::class, 'periodo_id');
    }

    /**
     * Relación con nivel educativo
     */
    public function nivelEducativo(): BelongsTo
    {
        return $this->belongsTo(NivelEducativo::class, 'nivel_codigo', 'codigo');
    }

    /**
     * Scope por fecha
     */
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    /**
     * Scope por periodo
     */
    public function scopePorPeriodo($query, $periodoId)
    {
        return $query->where('periodo_id', $periodoId);
    }

    /**
     * Scope por estado
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope por nivel educativo
     */
    public function scopePorNivel($query, string $nivelCodigo)
    {
        return $query->where('nivel_codigo', $nivelCodigo);
    }
}
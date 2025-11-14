<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternadoConducta extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'internado_conductas';

    protected $fillable = [
        'participante_id',
        'periodo_id',
        'calificacion',
        'descripcion',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public const CALIFICACIONES = ['excelente', 'buena', 'regular', 'mala'];

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
     * Obtener valor numérico de la conducta
     */
    public function getValorNumericoAttribute(): int
    {
        $valores = [
            'excelente' => 10,
            'buena' => 8,
            'regular' => 6,
            'mala' => 4,
        ];

        return $valores[$this->calificacion] ?? 0;
    }

    /**
     * Scope por periodo
     */
    public function scopePorPeriodo($query, $periodoId)
    {
        return $query->where('periodo_id', $periodoId);
    }

    /**
     * Scope por calificación
     */
    public function scopePorCalificacion($query, $calificacion)
    {
        return $query->where('calificacion', $calificacion);
    }
}
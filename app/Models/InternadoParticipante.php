<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternadoParticipante extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'internado_participantes';

    protected $fillable = [
        'estudiante_codigo',
        'estado',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relación con el estudiante
     */
    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_codigo', 'codigo');
    }

    /**
     * Relación con calificaciones
     */
    public function calificaciones(): HasMany
    {
        return $this->hasMany(InternadoCalificacion::class, 'participante_id');
    }

    /**
     * Obtener promedio ponderado del participante
     */
    public function getPromedioGeneralAttribute(): float
    {
        $calificaciones = $this->calificaciones()
            ->with('evaluacion')
            ->whereNotNull('nota')
            ->get();

        if ($calificaciones->isEmpty()) {
            return 0.0;
        }

        $totalPonderado = $calificaciones->sum(function ($calificacion) {
            return $calificacion->nota_ponderada;
        });

        $totalPeso = $calificaciones->sum(function ($calificacion) {
            return $calificacion->evaluacion->peso_porcentual ?? 0;
        });

        if ($totalPeso == 0) {
            return 0.0;
        }

        // Normalizar a escala de 10
        return ($totalPonderado / $totalPeso) * 10;
    }

    /**
     * Obtener cantidad de evaluaciones calificadas
     */
    public function getEvaluacionesCalificadasAttribute(): int
    {
        return $this->calificaciones()->whereNotNull('nota')->count();
    }

    /**
     * Obtener cantidad total de evaluaciones asignadas
     */
    public function getTotalEvaluacionesAttribute(): int
    {
        return $this->calificaciones()->count();
    }

    /**
     * Verificar si el participante está activo
     */
    public function isActivo(): bool
    {
        return $this->estado === 'activo';
    }
}
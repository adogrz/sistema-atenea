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

    protected $appends = [
        'nivel_educativo',
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

    public function getNivelEducativoAttribute($value): ?string
    {
        if (!empty($value)) {
            return $value;
        }
        return optional($this->estudiante)->nivel_educativo;
    }

    /**
     * Relación con calificaciones
     */
    public function calificaciones(): HasMany
    {
        return $this->hasMany(InternadoCalificacion::class, 'participante_id');
    }

    /**
     * Relación con asistencias
     */
    public function asistencias(): HasMany
    {
        return $this->hasMany(InternadoAsistencia::class, 'participante_id');
    }

    /**
     * Relación con conductas
     */
    public function conductas(): HasMany
    {
        return $this->hasMany(InternadoConducta::class, 'participante_id');
    }

    /**
     * Obtener promedio ponderado
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

        $totalPonderado = $calificaciones->sum(fn($c) => $c->nota_ponderada);
        $totalPeso = $calificaciones->sum(fn($c) => $c->evaluacion->peso_porcentual ?? 0);

        if ($totalPeso == 0) {
            return 0.0;
        }

        return ($totalPonderado / $totalPeso) * 10;
    }

    /**
     * Obtener total de créditos extra acumulados
     */
    public function getTotalCreditosExtraAttribute(): float
    {
        return $this->calificaciones()
            ->whereNotNull('credito_extra')
            ->sum('credito_extra') ?? 0.0;
    }

    /**
     * Obtener porcentaje de asistencia por periodo
     */
    public function getPorcentajeAsistenciaPorPeriodo(int $periodoId): float
    {
        $total = $this->asistencias()->where('periodo_id', $periodoId)->count();
        
        if ($total === 0) {
            return 0.0;
        }

        $presentes = $this->asistencias()
            ->where('periodo_id', $periodoId)
            ->whereIn('estado', ['presente', 'justificada'])
            ->count();

        return ($presentes / $total) * 100;
    }

    /**
     * Obtener conducta de un periodo
     */
    public function getConductaPorPeriodo(int $periodoId)
    {
        return $this->conductas()->where('periodo_id', $periodoId)->first();
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeConEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
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
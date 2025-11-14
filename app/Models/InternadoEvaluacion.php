<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternadoEvaluacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'internado_evaluaciones';

    protected $fillable = [
        'periodo_id',
        'materia_id',
        'nombre',
        'descripcion',
        'peso_porcentual',
        'nota_maxima',
        'fecha_inicio',
        'fecha_fin',
        'permite_credito_extra',
        'credito_extra_max',
    ];

    protected $casts = [
        'peso_porcentual' => 'decimal:2',
        'nota_maxima' => 'decimal:1',
        'credito_extra_max' => 'decimal:1',
        'permite_credito_extra' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relación con calificaciones
     */
    public function calificaciones(): HasMany
    {
        return $this->hasMany(InternadoCalificacion::class, 'evaluacion_id');
    }

    /**
     * Relación con periodo
     */
    public function periodo(): BelongsTo
    {
        return $this->belongsTo(InternadoPeriodo::class, 'periodo_id');
    }

    /**
     * Relación con materia
     */
    public function materia(): BelongsTo
    {
        return $this->belongsTo(InternadoMateria::class, 'materia_id');
    }

    /**
     * Obtener promedio de calificaciones
     */
    public function getPromedioAttribute(): float
    {
        return $this->calificaciones()
            ->whereNotNull('nota')
            ->avg('nota') ?? 0.0;
    }

    /**
     * Obtener cantidad de estudiantes calificados
     */
    public function getEstudiantesCalificadosAttribute(): int
    {
        return $this->calificaciones()
            ->whereNotNull('nota')
            ->count();
    }

    /**
     * Obtener cantidad total de estudiantes asignados
     */
    public function getTotalEstudiantesAttribute(): int
    {
        return $this->calificaciones()->count();
    }

    /**
     * Scope para evaluaciones ordenadas por peso
     */
    public function scopeOrderByPeso($query)
    {
        return $query->orderBy('peso_porcentual', 'desc');
    }

    /**
     * Obtener cantidad de calificaciones completadas
     */
    public function getCalificacionesCompletadasAttribute(): int
    {
        return $this->calificaciones()
            ->whereNotNull('nota')
            ->count();
    }
}
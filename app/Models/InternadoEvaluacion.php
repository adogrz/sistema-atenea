<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternadoEvaluacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'internado_evaluaciones';

    protected $fillable = [
        'nombre',
        'descripcion',
        'peso_porcentual',
        'nota_maxima',
    ];

    protected $casts = [
        'peso_porcentual' => 'decimal:2',
        'nota_maxima' => 'decimal:1',
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
}
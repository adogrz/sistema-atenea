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
        'niveles_aplicables',
    ];

    protected $casts = [
        'peso_porcentual' => 'decimal:2',
        'nota_maxima' => 'decimal:1',
        'credito_extra_max' => 'decimal:1',
        'permite_credito_extra' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'niveles_aplicables' => 'array',
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
     * Verificar si la evaluación aplica para un nivel específico
     */
    public function aplicaParaNivel(int $nivelCodigo): bool
    {
        if (empty($this->niveles_aplicables)) {
            return false;
        }

        return in_array($nivelCodigo, $this->niveles_aplicables);
    }

    /**
     * Verificar si es obligatoria para un nivel
     */
    public function agregarNivel(int $nivelCodigo): void
    {
        $niveles = $this->niveles_aplicables ?? [];
        
        if (!in_array($nivelCodigo, $niveles)) {
            $niveles[] = $nivelCodigo;
            $this->niveles_aplicables = $niveles;
            $this->save();
        }
    }

    /**
     * Remover nivel de la evaluación
     */
    public function removerNivel(int $nivelCodigo): void
    {
        if (empty($this->niveles_aplicables)) {
            return;
        }

        $niveles = array_diff($this->niveles_aplicables, [$nivelCodigo]);
        $this->niveles_aplicables = array_values($niveles);
        $this->save();
    }

    /**
     * Obtener códigos de niveles aplicables
     */
    public function getNivelesCodigosAttribute(): array
    {
        return $this->niveles_aplicables ?? [];
    }

    /**
     * Obtener niveles como string
     */
    public function getNivelesTextAttribute(): string
    {
        if (empty($this->niveles_aplicables)) {
            return 'Ninguno';
        }

        $codigos = $this->niveles_codigos;
        $niveles = NivelEducativo::whereIn('codigo', $codigos)->get();
        
        return $niveles->pluck('descripcion')->implode(', ');
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

    /**
     * Scope para evaluaciones de un nivel específico
     */
    public function scopePorNivel($query, int $nivelCodigo)
    {
        return $query->whereJsonContains('niveles_aplicables', $nivelCodigo);
    }

    /**
     * Verificar si la evaluación está asignada a un nivel específico (alias)
     */
    public function estaAsignadaANivel(int $nivelCodigo): bool
    {
        return $this->aplicaParaNivel($nivelCodigo);
    }

    /**
     * Obtener niveles asignados como string (alias)
     */
    public function getNivelesAsignadosAttribute(): string
    {
        return $this->niveles_text;
    }
}
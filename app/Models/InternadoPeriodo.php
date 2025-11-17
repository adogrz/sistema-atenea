<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternadoPeriodo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'internado_periodos';

    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relación con asistencias
     */
    public function asistencias(): HasMany
    {
        return $this->hasMany(InternadoAsistencia::class, 'periodo_id');
    }

    /**
     * Relación con conductas
     */
    public function conductas(): HasMany
    {
        return $this->hasMany(InternadoConducta::class, 'periodo_id');
    }

    /**
     * Verificar si el periodo está vigente
     */
    public function getEsVigenteAttribute(): bool
    {
        if (is_null($this->fecha_inicio) || is_null($this->fecha_fin)) {
            return false;
        }
        
        $hoy = now()->startOfDay();
        return $hoy->between($this->fecha_inicio, $this->fecha_fin);
    }

    /**
     * Scope para periodos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para periodo vigente
     */
    public function scopeVigente($query)
    {
        $hoy = now()->startOfDay();
        return $query->where('fecha_inicio', '<=', $hoy)
                    ->where('fecha_fin', '>=', $hoy);
    }

    /**
     * Scope ordenado por fecha
     */
    public function scopeOrdenado($query)
    {
        return $query->orderBy('fecha_inicio', 'desc');
    }
}

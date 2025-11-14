<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InternadoMateria extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'materias';

    protected $fillable = [
        'codigo',
        'nombre',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relación con evaluaciones del internado
     */
    public function evaluaciones(): HasMany
    {
        return $this->hasMany(InternadoEvaluacion::class, 'materia_id');
    }

    /**
     * Scope para buscar por código o nombre
     */
    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('codigo', 'like', "%{$termino}%")
              ->orWhere('nombre', 'like', "%{$termino}%");
        });
    }

    /**
     * Scope para ordenar por nombre
     */
    public function scopeOrdenadaPorNombre($query)
    {
        return $query->orderBy('nombre');
    }
}
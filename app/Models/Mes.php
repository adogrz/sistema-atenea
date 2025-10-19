<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mes extends Model
{
    protected $table = 'mes';
    protected $primaryKey = 'idMes';
    public $timestamps = true; // tienes created_at y updated_at en la migración

    protected $fillable = [
        'nombre',
        'fechaInicio',
        'fechaFin',
        'fechaCierre',
        'idNivelEducativo',
    ];

    // Relación con el modelo Evaluacion
    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'idMes', 'idMes');
    }

    // Relación con el modelo NivelEducativo
    public function nivelEducativo()
    {
        return $this->belongsTo(NivelEducativo::class, 'idNivelEducativo', 'codigo');
    }
}

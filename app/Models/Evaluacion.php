<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluacion extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones';

    protected $fillable = [
        'inscripcion_id',
        'fase_olimpiada_id',
        'calificador_id',
        'total_puntaje',
        'finalizada_at',
    ];

    protected $casts = [
        'finalizada_at' => 'datetime',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'inscripcion_id', 'id');
    }
    
    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(InscripcionOlimpiada::class, 'inscripcion_id');
    }

    public function faseOlimpiada(): BelongsTo
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_olimpiada_id');
    }

    public function calificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calificador_id');
    }

    public function itemsEvaluados(): HasMany
    {
        return $this->hasMany(ItemEvaluado::class, 'evaluacion_id');
    }
}
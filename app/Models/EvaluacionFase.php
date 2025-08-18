<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluacionFase extends Model
{
    protected $table = 'evaluaciones_fase';

    protected $fillable = [
        'fase_olimpiada_id',
        'inscripcion_id',
        'calificador_id',
        'estado',
        'total',
    ];

    /* ========================
     |  Relaciones
     ========================*/

    public function fase(): BelongsTo
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_olimpiada_id');
    }

    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(InscripcionOlimpiada::class, 'inscripcion_id');
    }

    public function calificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calificador_id');
    }

    public function itemsEvaluados(): HasMany
    {
        return $this->hasMany(ItemEvaluado::class, 'evaluacion_fase_id');
    }
}
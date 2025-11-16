<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemEvaluado extends Model
{
    use HasFactory;

    protected $table = 'items_evaluados';

    protected $fillable = [
        'evaluacion_id',
        'item_definido_id',
        'puntaje',
        'observacion',
        'calificador_id', // Added
    ];

    public function evaluacion(): BelongsTo
    {
        return $this->belongsTo(Evaluacion::class, 'evaluacion_id');
    }

    public function itemDefinido(): BelongsTo
    {
        return $this->belongsTo(ItemDefinido::class, 'item_definido_id');
    }

    public function calificador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calificador_id');
    }
}
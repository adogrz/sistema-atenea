<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemEvaluado extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'items_evaluados';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'evaluacion_id',
        'item_codigo',
        'nota_final',
        'nota_real',
        'observaciones',
    ];

    public function evaluacion()
    {
        return $this->belongsTo(EvaluacionFase::class, 'evaluacion_id');
    }
}

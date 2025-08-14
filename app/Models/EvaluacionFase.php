<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluacionFase extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'evaluaciones_fase';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
    ];

    public function itemsEvaluados()
    {
        return $this->hasMany(ItemEvaluado::class, 'evaluacion_id');
    }
}

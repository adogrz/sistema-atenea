<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DefinicionEvaluacion extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'definiciones_evaluacion';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function itemsDefinidos()
    {
        return $this->hasMany(ItemDefinido::class, 'definicion_id');
    }
}

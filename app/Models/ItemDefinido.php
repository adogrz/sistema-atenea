<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemDefinido extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'items_definidos';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'definicion_id',
        'item_codigo',
        'titulo',
        'descripcion',
        'valor_maximo',
        'orden',
    ];

    public function definicion()
    {
        return $this->belongsTo(DefinicionEvaluacion::class, 'definicion_id');
    }
}

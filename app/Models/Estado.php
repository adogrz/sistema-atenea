<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'estados';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NivelEducativo extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'niveles_educativos';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'codigo',
        'descripcion',
        'nivel',
        'id_sede',
    ]; 
}

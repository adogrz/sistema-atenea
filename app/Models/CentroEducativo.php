<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentroEducativo extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'centros_educativos';

    // Clave primaria personalizada
    protected $primaryKey = 'codigo';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'codigo',
        'nombre',
        'departamento',
        'distrito',
        'sector',
        'zona',
        'direccion',
        'internacional',
    ];
}
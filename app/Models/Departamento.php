<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * 
     * @var string
     */
    protected $table = 'departamentos';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nombre_departamento',
    ];

    /**
     * Relación con municipios.
     * Un departamento puede tener muchos municipios.
     */
    public function municipios()
    {
        return $this->hasMany(Municipio::class, 'id_departamento');
    }
}
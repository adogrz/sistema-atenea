<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Municipio extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'municipios';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id_departamento',
        'nombre_municipio',
    ];

    /**
     * Relación con el modelo Departamento.
     * Un municipio pertenece a un departamento.
     */
    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'id_departamento');
    }

    /**
     * Relación con distritos.
     * Un municipio puede tener muchos distritos.
     */
    public function distritos()
    {
        return $this->hasMany(Distrito::class, 'id_municipio');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaseOlimpiada extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'fases_olimpiadas';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'olimpiada_id',
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'nota_minima',
        'modalidad',
        'activa',
        'descripcion',
    ];

    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class);
    }

    public function inscripciones()
    {
        return $this->hasMany(InscripcionOlimpiada::class, 'fase_id');
    }
}
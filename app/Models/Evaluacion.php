<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    protected $table = 'evaluacion';
    protected $primaryKey = 'id';
    public $timestamps = false; 

    protected $fillable = [
        'nombre',
        'creditoExtra',
        'porcentaje',
        'idMes',
    ];

    // Relación con el modelo Mes
    public function mes()
    {
        return $this->belongsTo(Mes::class, 'idMes', 'idMes');
    }
}

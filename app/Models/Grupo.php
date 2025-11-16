<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    protected $fillable = ['nombre', 'descripcion', 'horario', 'area_id'];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }
}

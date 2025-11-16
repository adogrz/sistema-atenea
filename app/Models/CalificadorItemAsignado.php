<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalificadorItemAsignado extends Model
{
    use HasFactory;

    protected $table = 'calificador_item_asignado';

    protected $fillable = [
        'calificador_id',
        'fase_olimpiada_id',
        'item_definido_id',
    ];

    public function calificador()
    {
        return $this->belongsTo(User::class, 'calificador_id');
    }

    public function faseOlimpiada()
    {
        return $this->belongsTo(FaseOlimpiada::class, 'fase_olimpiada_id');
    }

    public function itemDefinido()
    {
        return $this->belongsTo(ItemDefinido::class, 'item_definido_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Area extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'description'];

    /**
     * Usuarios asociados a esta área
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_area')
            ->withPivot('is_primary');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sede extends Model
{

    use HasFactory;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sedes'; // Explicitly define the table name, though often not strictly necessary if following conventions.

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'name'; // Tell Eloquent that 'name' is the primary key

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false; // Tell Eloquent that the primary key is NOT auto-incrementing

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string'; // Tell Eloquent that the primary key type is a string

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // If you have any date columns that aren't 'created_at'/'updated_at'
        // or other columns that need specific casting, define them here.
    ];
}

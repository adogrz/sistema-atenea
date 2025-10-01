<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Responsable extends Model
{

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'responsables';


    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'dui',
        'codigo_estudiante',
        'nombres_responsable',
        'apellidos_responsable',
        'email_responsable',
        'telefono_responsable',
        'telefono_opcional',
        'tipo_parentesco',
        'otro_parentesco',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'codigo_estudiante', 'codigo');
    }

    /**
     * Tiene consentimientos del estudiante
     */
    public function consentForms(): HasMany
    {
        return $this->hasMany(ConsentForm::class, 'responsible_id');
    }
}

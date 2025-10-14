<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Estudiante extends Model
{
    use HasFactory;
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'estudiantes';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
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
        'user_id',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'sexo',
        'fecha_nacimiento',
        'centro_educativo',
        'nie',
        'telefono_estudiante',
        'telefono_casa',
        'email',
        'direccion_id',
        'nivel_educativo',
        'aprobado',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'fecha_nacimiento' => 'date',
        'aprobado' => 'boolean',
    ];

    /**
     * Relación con el modelo Responsable
     */
    public function responsable(): HasOne
    {
        return $this->hasOne(Responsable::class, 'codigo_estudiante', 'codigo');
    }

    /**
     * Relación con el modelo CentroEducativo
     */
    public function centroEducativo(): BelongsTo
    {
        return $this->belongsTo(CentroEducativo::class, 'centro_educativo', 'codigo');
    }

    /**
     * Relación con el modelo NivelEducativo
     */
    public function nivelEducativo(): BelongsTo
    {
        return $this->belongsTo(NivelEducativo::class, 'nivel_educativo', 'codigo');
    }

    /**
     * Relación con el modelo Distrito
     */
    public function distrito(): BelongsTo
    {
        return $this->belongsTo(Distrito::class, 'distrito', 'id');
    }

    /**
     * Relación con la dirección normalizada
     */
    public function direccion(): BelongsTo
    {
        return $this->belongsTo(Direccion::class, 'direccion_id');
    }

    /**
     * Obtener la dirección completa formateada
     */
    public function getDireccionCompleta(): string
    {
        return $this->direccion?->getDireccionFormateadaAttribute() ?? 'Sin dirección';
    }
}

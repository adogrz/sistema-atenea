<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class BitacoraInscripcion extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla en la base de datos.
     * @var string
     */
    protected $table = 'bitacora_inscripciones';

    /**
     * Atributos que se pueden asignar masivamente.
     * @var array
     */
    protected $fillable = [
        'inscripcion_id',
        'usuario_id',
        'accion',
        'fecha',
    ];

    /**
     * Casts para los atributos.
     * @var array
     */
    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
        'fecha' => 'datetime',
    ];

    /**
     * Relación con la inscripción.
     */
    public function inscripcion()
    {
        return $this->belongsTo(InscripcionOlimpiada::class);
    }

    /**
     * Relación con el usuario que realizó la acción.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para filtrar por acción.
     */
    public function scopePorAccion($query, string $accion)
    {
        return $query->where('accion', $accion);
    }

    /**
     * Scope para filtrar por estudiante.
     */
    public function scopePorEstudiante($query, string $codigo)
    {
        return $query->whereHas('inscripcion', function ($q) use ($codigo) {
            $q->where('codigo_estudiante', $codigo);
        });
    }

    /**
     * Scope para obtener las inscripciones más recientes.
     */
    public function scopeRecientes($query)
    {
        return $query->orderByDesc('fecha');
    }

    /**
     * Registra un cambio en la bitácora.
     */
    public static function registrarCambio($inscripcion, string $accion, array $antes = null, array $despues = null)
    {
        return self::create([
            'inscripcion_id' => $inscripcion->id,
            'usuario_id' => Auth::id(),
            'accion' => $accion,
            'datos_anteriores' => $antes,
            'datos_nuevos' => $despues,
            'fecha' => now(),
        ]);
    }
}
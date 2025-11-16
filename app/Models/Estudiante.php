<?php

namespace App\Models;

use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\ConsentForm;
use App\Models\ClinicalRecord\MedicalRecord;
use App\Models\ClinicalRecord\PsychologicalRecord;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    protected $appends = ['nombre_completo'];

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
     * Relación con el usuario asociado al estudiante
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con el modelo Responsable
     */
    public function responsable(): HasOne
    {
        return $this->hasOne(Responsable::class, 'codigo_estudiante', 'codigo');
    }

    /**
     * Relación con múltiples Responsables (padre, madre, tutor, etc.)
     */
    public function responsables(): HasMany
    {
        return $this->hasMany(Responsable::class, 'codigo_estudiante', 'codigo');
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
     * Relación con el modelo Dirección
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

    /**
     * Determinar si el estudiante es menor de edad (menor de 18 años)
     *
     * @return bool
     */
    public function isMinor(): bool
    {
        if (!$this->fecha_nacimiento) {
            return false;
        }

        return $this->fecha_nacimiento->age < 18;
    }

    /**
     * Asignaciones clinicas del estudiante
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'student_nie', 'nie');
    }

    /**
     * Expediente médico del estudiante
     */
    public function medicalRecord(): HasOne
    {
        return $this->hasOne(MedicalRecord::class, 'student_nie', 'nie');
    }

    /**
     * Expediente psicológico del estudiante
     */
    public function psychologicalRecord(): HasOne
    {
        return $this->hasOne(PsychologicalRecord::class, 'student_nie', 'nie');
    }

    /**
     * Consentimientos del estudiante
     */
    public function consentForms(): HasMany
    {
        return $this->hasMany(ConsentForm::class, 'student_nie', 'nie');
    }
  
     /**
     *  Relación con el internado FDTC
     */
    public function internadoParticipante(): HasOne
    {
        return $this->hasOne(InternadoParticipante::class, 'estudiante_codigo', 'codigo')
            ->whereNull('deleted_at');
    }

    /**
     * Verificar si está en el internado
     */
    public function estaEnInternado(): bool
    {
        return $this->internadoParticipante()
            ->where('estado', 'activo')
            ->exists();
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->primer_nombre} {$this->segundo_nombre} {$this->primer_apellido} {$this->segundo_apellido}");
    }

    /**
     * Genera y asigna un código permanente único al estudiante.
     */
    public function generateAndAssignPermanentCode(): void
    {
        // Generar un código único (ej. UUID, o un formato específico)
        // Por simplicidad, usaremos un UUID v4. Asegúrate de que el paquete 'ramsey/uuid' esté instalado.
        // composer require ramsey/uuid
        $newCode = (string) \Illuminate\Support\Str::uuid();

        // Asegurarse de que el código sea único en la tabla
        while (Estudiante::where('codigo', $newCode)->exists()) {
            $newCode = (string) \Illuminate\Support\Str::uuid();
        }

        $this->codigo = $newCode;
        $this->aprobado = true; // Marcar como aprobado al asignar código permanente
        $this->save();
    }
}

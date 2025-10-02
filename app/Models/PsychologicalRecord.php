<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class PsychologicalRecord extends Model
{
    use SoftDeletes, LogsActivity;

    /**
     * The relationships that should always be loaded.
     *
     * @var array<int, string>
     */
    protected $with = ['student'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_nie',
        'initial_assessment',
        'created_by',
        'change_justification',
    ];

    /**
     * Obten el estudiante asociado a este expediente.
     */
    public function student()
    {
        return $this->belongsTo(Estudiante::class, 'student_nie', 'nie');
    }

    /**
     * Obten el creador de este expediente.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Sesiones psicológicas asociadas a este expediente.
     */
    public function psychologicalSessions()
    {
        return $this->hasMany(PsychologicalSession::class, 'psychological_record_id');
    }

    /**
     * Scope para filtrar por estudiante.
     */
    public function scopeForStudent(Builder $query, string $studentNie): Builder
    {
        return $query->where('student_nie', $studentNie);
    }

    /**
     * Scope para filtrar por creador.
     */
    public function scopeForCreator(Builder $query, int $creatorId): Builder
    {
        return $query->where('created_by', $creatorId);
    }

    /**
     * Scope para expedientes recientes
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope para expedientes con evaluaciones iniciales
     */
    public function scopeWithInitialAssessment(Builder $query): Builder
    {
        return $query->whereNotNull('initial_assessment')->where('initial_assessment', '!=', '');
    }

    /**
     * Verifca si el expediente tiene una evaluación inicial.
     */
    public function hasInitialAssessment(): bool
    {
        return !empty($this->initial_assessment);
    }

    /**
     * Obtiene información básica del expediente
     */
    public function getSummary(): array
    {
        return [
            'student' => $this->student->primer_nombre . ' ' . $this->student->primer_apellido,
            'nie' => $this->student_nie,
            'has_initial_assessment' => $this->hasInitialAssessment(),
            'created_by' => $this->creator->name,
            'created_at' => $this->created_at->format('d/m/Y'),
        ];
    }

    /**
     * Configuración para el registro de actividades
     */
    public function getActivitylogOptions()
    {
        return LogOptions::defaults()
        ->logOnly(['student_nie', 'initial_assessment', 'change_justification'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs()
        ->useLogName('psychological_record')
        ->setDescriptionForEvent(fn(string $eventName) => "Expediente psicológico {$eventName}")
        ->dontLogIfAttributesChangedOnly(['updated_at']);
    }

    /**
     * Descripción personalizada para los logs
     */
    public function getDescriptionForEvent(string $eventName): string
    {
        $studentName = $this->student->primer_nombre ?? 'N/A';
        $creatorName = $this->creator->name ?? 'N/A';

        $description = match ($eventName) {
            'created' => "Expediente psicológico creado para {$studentName} por {$creatorName}",
            'updated' => "Expediente psicológico de {$studentName} actualizado",
            'deleted' => "Expediente psicológico de {$studentName} eliminado",
            default => "Expediente psicológico de {$studentName} {$eventName}",
        };

        // Agregar justificación si existe
        if (!empty($this->change_justification)) {
            $description .= " | Justificación: {$this->change_justification}";
        }

        return $description;
    }
}

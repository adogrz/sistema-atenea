<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Assignment extends Model
{
    use LogsActivity, SoftDeletes;

    public const TYPE_MEDICAL = 'medical';
    public const TYPE_PSYCHOLOGICAL = 'psychological';

    /**
     * The relationships that should always be loaded.
     *
     * @var array<int, string>
     */
    protected $with = ['student', 'professional'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_nie',
        'professional_id',
        'type',
        'is_active',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Obten el estudiante asociado a esta asignación.
     */
    public function student()
    {
        return $this->belongsTo(Estudiante::class, 'student_nie', 'nie');
    }

    /**
     * Obten el profesional asociado a esta asignación.
     */
    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    /**
     * Scope para obtener solo asignaciones activas.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para filtrar por tipo.
     */
    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para filtrar por estudiante.
     */
    public function scopeForStudent(Builder $query, string $studentNie): Builder
    {
        return $query->where('student_nie', $studentNie);
    }

    /**
     * Scope para filtrar por profesional.
     */
    public function scopeForProfessional(Builder $query, int $professionalId): Builder
    {
        return $query->where('professional_id', $professionalId);
    }

    /**
     * Scope para asignaciones médicas.
     */
    public function scopeMedical(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_MEDICAL);
    }

    /**
     * Scope para asignaciones psicológicas.
     */
    public function scopePsychological(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_PSYCHOLOGICAL);
    }

    /**
     * Verifica si la asignación está activa
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Obtiene el tipo de asignación en español
     */
    public function getTypeLabel(): string
    {
        return $this->type === self::TYPE_MEDICAL ? 'Médica' : 'Psicológica';
    }

    /**
     * Obtiene información resumida de la asignación
     */
    public function getSummary(): array
    {
        return [
            'student' => $this->student->primer_nombre . ' ' . $this->student->primer_apellido,
            'nie' => $this->student_nie,
            'professional' => $this->professional->name,
            'type_label' => $this->getTypeLabel(),
            'is_active' => $this->isActive(),
            'assigned_at' => $this->created_at->format('d/m/Y'),
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_nie', 'professional_id', 'type', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('assignment')
            ->setDescriptionForEvent(fn(string $eventName) => "Asignación {$eventName}")
            ->dontLogIfAttributesChangedOnly(['updated_at']);
    }

    /**
     * Personaliza la descripción del evento para los logs de actividad.
     */
    public function getDescriptionForEvent(string $eventName): string
    {
        $studentName = $this->student->primer_nombre ?? 'N/A';
        $professionalName = $this->professional->name ?? 'N/A';
        $typeLabel = $this->getTypeLabel();

        return match ($eventName) {
            'created' => "Asignación {$typeLabel} creada: {$studentName} → {$professionalName}",
            'updated' => "Asignación {$typeLabel} de {$studentName} actualizada",
            'deleted' => "Asignación {$typeLabel} de {$studentName} eliminada",
            default => "Asignación {$typeLabel} de {$studentName} {$eventName}",
        };
    }
}

<?php

namespace App\Models\ClinicalRecord;

use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class MedicalRecord extends Model
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
        'general_background',
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
     * Consultas médicas asociadas a este expediente.
     */
    public function medicalConsultations()
    {
        return $this->hasMany(MedicalConsultation::class, 'medical_record_id');
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
     * Scope para expedientes con antecedentes
     */
    public function scopeWithBackground(Builder $query): Builder
    {
        return $query->whereNotNull('general_background')
                    ->where('general_background', '!=', '');
    }

    /**
     * Verifica si el expediente tiene antecedentes médicos registrados
     */
    public function hasBackground(): bool
    {
        return !empty($this->general_background);
    }

    /**
     * Obtiene información básica del expediente
     */
    public function getSummary(): array
    {
        return [
            'student' => $this->student->primer_nombre . ' ' . $this->student->primer_apellido,
            'nie' => $this->student_nie,
            'has_background' => $this->hasBackground(),
            'created_by' => $this->creator->name,
            'created_at' => $this->created_at->format('d/m/Y'),
        ];
    }

    /**
     * Configuración para el registro de actividades
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_nie', 'general_background', 'change_justification'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('medical_record')
            ->setDescriptionForEvent(fn(string $eventName) => "Expediente médico {$eventName}")
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
            'created' => "Expediente médico creado para {$studentName} por {$creatorName}",
            'updated' => "Expediente médico de {$studentName} actualizado",
            'deleted' => "Expediente médico de {$studentName} eliminado",
            default => "Expediente médico de {$studentName} {$eventName}",
        };

        // Agregar justificación si existe
        if (!empty($this->change_justification)) {
            $description .= " | Justificación: {$this->change_justification}";
        }

        return $description;
    }
}

<?php

namespace App\Models\ClinicalRecord;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class PsychologicalSession extends Model
{
    use SoftDeletes, LogsActivity;

    /**
     * The relationships that should always be loaded.
     *
     * @var array<int, string>
     */
    protected $with = ['psychologist', 'psychologicalRecord'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'psychological_record_id',
        'psychologist_id',
        'consent_form_id',
        'session_date',
        'session_content',
        'test_results',
        'observations',
        'change_justification',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'session_date' => 'datetime',
    ];

    /**
     * Obten el expediente psicológico asociado a esta sesión.
     */
    public function psychologicalRecord()
    {
        return $this->belongsTo(PsychologicalRecord::class);
    }

    /**
     * Obten el psicólogo que realizó esta sesión.
     */
    public function psychologist()
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    /**
     * Obten el formulario de consentimiento asociado a esta sesión.
     */
    public function consentForm()
    {
        return $this->belongsTo(ConsentForm::class, 'consent_form_id');
    }

    /**
     * Scope para sesiones recientes.
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('session_date', '>=', now()->subDays($days));
    }

    /**
     * Scope para filtrar sesiones entre dos fechas.
     */
    public function scopeBetweenDates(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('session_date', [$from, $to]);
    }

    /**
     * Scope para filtrar por psicólogo.
     */
    public function scopeForPsychologist(Builder $query, int $psychologistId): Builder
    {
        return $query->where('psychologist_id', $psychologistId);
    }

    /**
     * Scope para filtrar por expediente psicológico.
     */
    public function scopeForPsychologicalRecord(Builder $query, int $recordId): Builder
    {
        return $query->where('psychological_record_id', $recordId);
    }

    /**
     * Verifica si la sesión tiene un consentimiento asociado.
     */
    public function hasConsent(): bool
    {
        return !is_null($this->consent_form_id);
    }

    /**
     * Obtiene el nombre del estudiante
     */
    public function getStudentName(): string
    {
        return $this->psychologicalRecord->student->primer_nombre . ' ' . $this->psychologicalRecord->student->primer_apellido;
    }

    /**
     * Obtiene información resumida de la consulta
     */
    public function getSummary(): array
    {
        return [
            'date' => $this->session_date->format('d/m/Y H:i'),
            'student' => $this->getStudentName(),
            'psychologist' => $this->psychologist->name,
            'session_content' => $this->session_content,
            'has_consent' => $this->hasConsent(),
        ];
    }

    /**
     * Configuración para el logging de actividades
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['psychological_record_id', 'psychologist_id', 'session_date', 'session_content', 'change_justification'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('psychological_session')
            ->setDescriptionForEvent(fn(string $eventName) => "Sesión psicológica {$eventName}")
            ->dontLogIfAttributesChangedOnly(['updated_at', 'observations']);
    }

    /**
     * Descripción personalizada para los logs
     */
    public function getDescriptionForEvent(string $eventName): string
    {
        $studentName = $this->psychologicalRecord->student->primer_nombre ?? 'N/A';
        $psychologistName = $this->psychologist->name ?? 'N/A';
        $date = $this->session_date->format('d/m/Y');

        $description = match ($eventName) {
            'created' => "Sesión psicológica creada para {$studentName} por {$psychologistName} el {$date}",
            'updated' => "Sesión psicológica de {$studentName} actualizada por {$psychologistName}",
            'deleted' => "Sesión psicológica de {$studentName} eliminada",
            default => "Sesión psicológica de {$studentName} {$eventName}",
        };

        // Agregar justificación si existe
        if (!empty($this->change_justification)) {
            $description .= " | Justificación: {$this->change_justification}";
        }

        return $description;
    }
}

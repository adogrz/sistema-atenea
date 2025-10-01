<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class MedicalConsultation extends Model
{
    use SoftDeletes, LogsActivity;

    /**
     * The relationships that should always be loaded.
     *
     * @var array<int, string>
     */
    protected $with = ['doctor', 'medicalRecord'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'medical_record_id',
        'doctor_id',
        'consent_form_id',
        'consultation_date',
        'diagnosis',
        'treatment',
        'observations',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'consultation_date' => 'datetime',
    ];

    /**
     * Obten el expediente médico asociado a esta consulta.
     */
    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    /**
     * Obten el doctor que realizó esta consulta.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Obten el consentimiento asociado a esta consulta.
     */
    public function consentForm()
    {
        return $this->belongsTo(ConsentForm::class);
    }

    /**
     * Scope para filtrar consultas recientes.
     */
    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('consultation_date', '>=', now()->subDays($days));
    }

    /**
     * Scope para filtrar por rango de fechas.
     */
    public function scopeBetweenDates(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('consultation_date', [$from, $to]);
    }

    /**
     * Scope para filtrar por doctor.
     */
    public function scopeForDoctor(Builder $query, int $doctorId): Builder
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope para filtrar por expediente médico.
     */
    public function scopeForMedicalRecord(Builder $query, int $medicalRecordId): Builder
    {
        return $query->where('medical_record_id', $medicalRecordId);
    }

    /**
     * Scope para consultas con tratamiento prescrito.
     */
    public function scopeWithTreatment(Builder $query): Builder
    {
        return $query->whereNotNull('treatment')
            ->where('treatment', '!=', '');
    }

    /**
     * Verifica si la consulta tiene tratamiento prescrito
     */
    public function hasTreatment(): bool
    {
        return !empty($this->treatment);
    }

    /**
     * Verifica si la consulta tiene consentimiento asociado
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
        return $this->medicalRecord->student->primer_nombre . ' ' .
            $this->medicalRecord->student->primer_apellido;
    }

    /**
     * Obtiene información resumida de la consulta
     */
    public function getSummary(): array
    {
        return [
            'date' => $this->consultation_date->format('d/m/Y H:i'),
            'student' => $this->getStudentName(),
            'doctor' => $this->doctor->name,
            'diagnosis' => $this->diagnosis,
            'has_treatment' => $this->hasTreatment(),
            'has_consent' => $this->hasConsent(),
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['medical_record_id', 'doctor_id', 'consultation_date', 'diagnosis', 'treatment'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('medical_consultation')
            ->setDescriptionForEvent(fn(string $eventName) => "Consulta médica {$eventName}")
            ->dontLogIfAttributesChangedOnly(['updated_at', 'observations']);
    }

    /**
     * Descripción personalizada para los logs
     */
    public function getDescriptionForEvent(string $eventName): string
    {
        $studentName = $this->medicalRecord->student->primer_nombre ?? 'N/A';
        $doctorName = $this->doctor->name ?? 'N/A';
        $date = $this->consultation_date->format('d/m/Y');

        return match ($eventName) {
            'created' => "Consulta médica creada para {$studentName} por Dr. {$doctorName} el {$date}",
            'updated' => "Consulta médica de {$studentName} actualizada por Dr. {$doctorName}",
            'deleted' => "Consulta médica de {$studentName} eliminada",
            default => "Consulta médica de {$studentName} {$eventName}",
        };
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ConsentForm extends Model
{
    use SoftDeletes, LogsActivity;

    public const TYPE_MEDICAL = 'medical';
    public const TYPE_PSYCHOLOGICAL = 'psychological';

    /**
     * The relationships that should always be loaded.
     *
     * @var array<int, string>
     */
    protected $with = ['student', 'responsible'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_nie',
        'responsible_id',
        'professional_id',
        'type',
        'granted_at',
        'file_path',
        'observations',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'granted_at' => 'date',
    ];

    /**
     * Obten el estudiante asociado a este documento de consentimiento.
     */
    public function student()
    {
        return $this->belongsTo(Estudiante::class, 'student_nie', 'nie');
    }

    /**
     * Obten el responsable que otorgó este consentimiento.
     */
    public function responsible()
    {
        return $this->belongsTo(Responsable::class, 'responsible_id');
    }

    /**
     * Obten el profesional que otorgó este consentimiento.
     */
    public function professional()
    {
        return $this->belongsTo(User::class, 'professional_id');
    }

    /**
     * Consultas médicas asociadas a este consentimiento.
     */
    public function medicalConsultations()
    {
        return $this->hasMany(MedicalConsultation::class, 'consent_form_id');
    }

    /**
     * Scope para filtrar por tipo de consentimiento.
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
     * Scope para consentimientos por responsable
     */
    public function scopeForResponsible(Builder $query, int $responsibleId): Builder
    {
        return $query->where('responsible_id', $responsibleId);
    }

    /**
     * Scope para filtrar por profesional.
     */
    public function scopeForProfessional(Builder $query, int $professionalId): Builder
    {
        return $query->where('professional_id', $professionalId);
    }

    /**
     * Scope para consentimientos medicos.
     */
    public function scopeMedical(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_MEDICAL);
    }

    /**
     * Scope para consentimientos psicologicos.
     */
    public function scopePsychological(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_PSYCHOLOGICAL);
    }

    /**
     * Scope para consentimientos con archivo
     */
    public function scopeWithFile(Builder $query): Builder
    {
        return $query->whereNotNull('file_path')
            ->where('file_path', '!=', '');
    }

    /**
     * Obtiene la URL del archivo si existe
     */
    public function getFileUrl(): ?string
    {
        if (!$this->hasFile()) {
            return null;
        }

        return asset('storage/' . str_replace('public/', '', $this->file_path));
    }

    /**
     * Verifica si el consentimiento tiene archivo adjunto
     */
    public function hasFile(): bool
    {
        return !empty($this->file_path) && file_exists(storage_path('app/' . $this->file_path));
    }

    /**
     * Obtiene información resumida del consentimiento
     */
    public function getSummary(): array
    {
        return [
            'student' => $this->student->primer_nombre . ' ' . $this->student->primer_apellido,
            'nie' => $this->student_nie,
            'responsible' => $this->responsible->nombres_responsable . ' ' . $this->responsible->apellidos_responsable,
            'type_label' => $this->type === self::TYPE_MEDICAL ? 'Médico' : 'Psicológico',
            'granted_date' => $this->granted_at->format('d/m/Y'),
            'has_file' => $this->hasFile(),
            'professional' => $this->relationLoaded('professional') ? $this->professional->name : 'N/A',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_nie', 'responsible_id', 'professional_id', 'type', 'granted_at', 'file_path'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('consent_form')
            ->setDescriptionForEvent(fn(string $eventName) => "Consentimiento {$eventName}")
            ->dontLogIfAttributesChangedOnly(['updated_at', 'observations']);
    }

    /**
     * Descripción personalizada para los logs
     */
    public function getDescriptionForEvent(string $eventName): string
    {
        $studentName = $this->student->primer_nombre ?? 'N/A';
        $responsibleName = $this->responsible->nombres_responsable ?? 'N/A';
        $typeLabel = $this->type === self::TYPE_MEDICAL ? 'médico' : 'psicológico';

        return match ($eventName) {
            'created' => "Consentimiento {$typeLabel} creado para {$studentName} por {$responsibleName}",
            'updated' => "Consentimiento {$typeLabel} de {$studentName} actualizado",
            'deleted' => "Consentimiento {$typeLabel} de {$studentName} eliminado",
            default => "Consentimiento {$typeLabel} de {$studentName} {$eventName}",
        };
    }
}

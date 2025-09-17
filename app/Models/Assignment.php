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
     * Verifica si la asignación está activa.
     *
     * @return bool
     */
    public function isActive()
    {
        return $this->is_active;
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_nie', 'professional_id', 'type', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('assignment');
    }
}

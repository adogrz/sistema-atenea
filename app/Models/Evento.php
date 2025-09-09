<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Evento extends Model
{
    protected $fillable = [
        'clasificacion',
        'descripcion',
        'fecha_inicio',
        'hora_inicio',
        'fecha_fin',
        'hora_fin',
        'nombre',
        'tipo',
        'ubicacion',
        'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Método para obtener el datetime completo de inicio
    public function getFechaHoraInicioAttribute()
    {
        $fecha = Carbon::parse($this->fecha_inicio);
        if ($this->hora_inicio) {
            $hora = Carbon::createFromFormat('H:i', $this->hora_inicio);
            return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(0);
        }
        return $fecha->startOfDay(); // 00:00:00 si no hay hora específica
    }

    // Método para obtener el datetime completo de fin
    public function getFechaHoraFinAttribute()
    {
        $fecha = Carbon::parse($this->fecha_fin);
        if ($this->hora_fin) {
            $hora = Carbon::createFromFormat('H:i', $this->hora_fin);
            return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(59);
        }
        return $fecha->endOfDay(); // 23:59:59 si no hay hora específica
    }

    //Definición de los tipos como constantes
    public const CLASIFICACION_REGISTRO = 'registro-aspirantes';
    public const CLASIFICACION_INSCRIPCION = 'inscripcion';
    public const CLASIFICACION_ACADEMIA_SABATINA = 'academia-sabatina';
    public const CLASIFICACION_FIN_DE_MES = 'fin-de-mes';
    public const CLASIFICACION_FDTC = 'fdtc';
    public const CLASIFICACION_FIN_DE_SEMANA = 'fin-de-semana';
    public const CLASIFICACION_EXAMEN = 'examen';
    public const CLASIFICACION_GRADUACION = 'graduacion';

    public static function getClasificaciones(): array
    {
        return [
            self::CLASIFICACION_REGISTRO,
            self::CLASIFICACION_INSCRIPCION,
            self::CLASIFICACION_ACADEMIA_SABATINA,
            self::CLASIFICACION_FIN_DE_MES,
            self::CLASIFICACION_FDTC,
            self::CLASIFICACION_FIN_DE_SEMANA,
            self::CLASIFICACION_EXAMEN,
            self::CLASIFICACION_GRADUACION,
        ];
    }

    public function getClasificacionLabelAttribute(): string
    {
        return self::getClasificacionLabels()[$this->clasificacion] ?? $this->clasificacion;
    }

    public function isActive(): bool
    {
        $ahora = Carbon::now();
        $inicio = Carbon::parse($this->fecha_inicio . ' ' . ($this->hora_inicio ?? '00:00:00'));
        $fin = Carbon::parse($this->fecha_fin . ' ' . ($this->hora_fin ?? '23:59:59'));

        return $ahora->between($inicio, $fin) && ($this->estado ?? 'activo') === 'activo';
    }

    // Scopes para tipos de eventos
    public function scopeOfType($query, $type)
    {
        return $query->where('clasificacion', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('estado', 'activo')->orWhereNull('estado');
    }

    // MÉTODOS ESTÁTICOS PARA VERIFICAR PERIODOS
    public static function isRegistrationOpen(): bool
    {
        return self::ofType(self::CLASIFICACION_REGISTRO)->active()->get()
            ->contains(fn($event) => $event->isActive());
    }

    public static function isInscriptionOpen(): bool
    {
        return self::ofType(self::CLASIFICACION_INSCRIPCION)->active()->get()
            ->contains(fn($event) => $event->isActive());
    }

    public static function isExamPeriod(): bool
    {
        return self::ofType(self::CLASIFICACION_EXAMEN)->active()->get()
            ->contains(fn($event) => $event->isActive());
    }

    // ACCESSOS PARA COMPATIBILIDAD CON EL FRONTEND
    public function getNameAttribute()
    {
        return $this->attributes['nombre'] ?? $this->descripcion;
    }

    public function getTypeAttribute()
    {
        return $this->attributes['clasificacion'] ?? $this->tipo;
    }

    public function getStartDateAttribute()
    {
        return $this->fecha_inicio ? $this->fecha_inicio->format('Y-m-d') : null;
    }

    public function getEndDateAttribute()
    {
        return $this->fecha_fin ? $this->fecha_fin->format('Y-m-d') : null;
    }

    public function getStartTimeAttribute()
    {
        return $this->hora_inicio;
    }

    public function getEndTimeAttribute()
    {
        return $this->hora_fin;
    }

    public function getLocationAttribute()
    {
        return $this->ubicacion;
    }

    public function getStatusAttribute()
    {
        return $this->estado;
    }

    public function getDescriptionAttribute()
    {
        return $this->descripcion;
    }

    public function getCreatedAtAttribute($value)
    {
        return $this->attributes['created_at'];
    }
}

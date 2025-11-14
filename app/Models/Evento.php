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

    // Constantes para clasificaciones
    public const CLASIFICACION_REGISTRO = 'registro-aspirantes';
    public const CLASIFICACION_INSCRIPCION = 'inscripcion';
    public const CLASIFICACION_ACADEMIA_SABATINA = 'academia-sabatina';
    public const CLASIFICACION_FIN_DE_MES = 'fin-de-mes';
    public const CLASIFICACION_FDTC = 'fdtc';
    public const CLASIFICACION_FIN_DE_SEMANA = 'fin-de-semana';
    public const CLASIFICACION_EXAMEN = 'examen';
    public const CLASIFICACION_GRADUACION = 'graduacion';

    // Método para obtener el datetime completo de inicio
    public function getFechaHoraInicioAttribute()
    {
        $fecha = Carbon::parse($this->fecha_inicio);
        if ($this->hora_inicio) {
            try {
                // Intentar parsear la hora de manera flexible (soporta H:i y H:i:s)
                $horaStr = substr($this->hora_inicio, 0, 5); // Tomar solo H:i si tiene segundos
                $hora = Carbon::createFromFormat('H:i', $horaStr);
                return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(0);
            } catch (\Exception $e) {
                // Si falla, intentar parsear directamente
                $hora = Carbon::parse($this->hora_inicio);
                return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(0);
            }
        }
        return $fecha->startOfDay();
    }

    // Método para obtener el datetime completo de fin
    public function getFechaHoraFinAttribute()
    {
        $fecha = Carbon::parse($this->fecha_fin);
        if ($this->hora_fin) {
            try {
                // Intentar parsear la hora de manera flexible (soporta H:i y H:i:s)
                $horaStr = substr($this->hora_fin, 0, 5); // Tomar solo H:i si tiene segundos
                $hora = Carbon::createFromFormat('H:i', $horaStr);
                return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(59);
            } catch (\Exception $e) {
                // Si falla, intentar parsear directamente
                $hora = Carbon::parse($this->hora_fin);
                return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(59);
            }
        }
        return $fecha->endOfDay();
    }

    // Método centralizado para verificar si el evento está activo
    public function isActive(): bool
    {
        $ahora = Carbon::now();
        return $ahora->between($this->fecha_hora_inicio, $this->fecha_hora_fin) 
               && ($this->estado ?? 'activo') === 'activo';
    }

    // Método para verificar si el evento está activo hoy específicamente
    public function isActiveToday(): bool
    {
        return $this->isActive();
    }

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

    public static function getClasificacionLabels(): array
    {
        return [
            self::CLASIFICACION_REGISTRO => 'Registro de Aspirantes',
            self::CLASIFICACION_INSCRIPCION => 'Inscripción',
            self::CLASIFICACION_ACADEMIA_SABATINA => 'Academia Sabatina',
            self::CLASIFICACION_FIN_DE_MES => 'Fin de Mes',
            self::CLASIFICACION_FDTC => 'FDTC',
            self::CLASIFICACION_FIN_DE_SEMANA => 'Fin de Semana',
            self::CLASIFICACION_EXAMEN => 'Examen',
            self::CLASIFICACION_GRADUACION => 'Graduación',
        ];
    }

    public function getClasificacionLabelAttribute(): string
    {
        return self::getClasificacionLabels()[$this->clasificacion] ?? $this->clasificacion;
    }

    // Scopes
    public function scopeOfType($query, $type)
    {
        return $query->where('clasificacion', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('estado', 'activo')->orWhereNull('estado');
    }

    // Métodos estáticos para verificar períodos específicos
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

    // Método para mapear a array (usado en múltiples controladores)
    public function toEventArray(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'clasificacion' => $this->clasificacion,
            'fecha_inicio' => $this->fecha_inicio?->format('Y-m-d'),
            'fecha_fin' => $this->fecha_fin?->format('Y-m-d'),
            'hora_inicio' => $this->hora_inicio,
            'hora_fin' => $this->hora_fin,
            'descripcion' => $this->descripcion,
            'ubicacion' => $this->ubicacion,
            'estado' => $this->estado,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

}

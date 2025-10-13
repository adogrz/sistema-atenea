<?php

namespace App\Console\Commands;

use App\Events\AcademicPeriodChanged;
use App\Models\Evento;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CheckAcademicPeriods extends Command
{
    protected $signature = 'academic:check-periods';
    protected $description = 'Verifica y actualiza períodos académicos automáticamente';

    public function handle(): void
    {
        $this->info('Verificando períodos académicos...');
        
        $now = Carbon::now();
        
        // Verificar eventos que deberían empezar ahora
        $this->checkStartingEvents($now);
        
        // Verificar eventos que deberían terminar ahora
        $this->checkEndingEvents($now);
        
        // Verificar eventos activos que ya deberían estar completados
        $this->checkExpiredEvents($now);

        // Limpiar cache de eventos inactivos
        $this->cleanInactivePeriodsCache();
        
        $this->info("Verificación de períodos académicos completada.");
    }

    private function checkStartingEvents(Carbon $now): void
    {
        $startingEvents = Evento::where('estado', 'activo')
            ->get()
            ->filter(function ($event) use ($now) {
                $fechaHoraInicio = $this->getFechaHoraInicio($event);
                // El evento debería empezar si la hora actual está dentro de los próximos 5 minutos del inicio
                return $now->between($fechaHoraInicio, $fechaHoraInicio->copy()->addMinutes(5));
            });

        foreach ($startingEvents as $event) {
            event(new AcademicPeriodChanged($event, 'started'));
            $this->info("Período iniciado: {$event->nombre}");
        }
    }

    private function checkEndingEvents(Carbon $now): void
    {
        $endingEvents = Evento::where('estado', 'activo')
            ->get()
            ->filter(function ($event) use ($now) {
                $fechaHoraFin = $this->getFechaHoraFin($event);
                // El evento debería terminar si ya pasó su hora de fin
                return $now->gt($fechaHoraFin);
            });

        foreach ($endingEvents as $event) {
            // Cambiar estado a completado
            $event->update(['estado' => 'completado']);
            
            // Disparar evento de finalización
            event(new AcademicPeriodChanged($event, 'ended'));
            
            $this->warn("Período terminado y marcado como completado: {$event->nombre}");
        }
    }

    private function checkExpiredEvents(Carbon $now): void
    {
        // Buscar eventos que siguen activos pero ya deberían estar completados
        $expiredEvents = Evento::where('estado', 'activo')
            ->get()
            ->filter(function ($event) use ($now) {
                $fechaHoraFin = $this->getFechaHoraFin($event);
                return $now->gt($fechaHoraFin);
            });

        foreach ($expiredEvents as $event) {
            $event->update(['estado' => 'completado']);
            event(new AcademicPeriodChanged($event, 'ended'));
            $this->warn("Evento expirado marcado como completado: {$event->nombre}");
        }

        if ($expiredEvents->count() > 0) {
            $this->info("{$expiredEvents->count()} evento(s) expirado(s) actualizados.");
        }
    }

    private function cleanInactivePeriodsCache(): void
    {
        $cacheKeys = [
            'registro_aspirantes_activo',
            'inscripcion_activa',
            'examen_activo',
            'academia_sabatina_activa'
        ];

        $cleanedCount = 0;
        foreach ($cacheKeys as $key) {
            if (Cache::get($key) && !$this->isPeriodCurrentlyActive($key)) {
                Cache::forget($key);
                $this->warn("Limpiado cache inactivo: {$key}");
                $cleanedCount++;
            }
        }

        if ($cleanedCount > 0) {
            $this->info("{$cleanedCount} cache(s) limpiados.");
        }
    }

    private function isPeriodCurrentlyActive(string $cacheKey): bool
    {
        $eventType = match ($cacheKey) {
            'registro_aspirantes_activo' => 'registro-aspirantes',
            'inscripcion_activa' => 'inscripcion',
            'examen_activo' => 'examen',
            'academia_sabatina_activa' => 'academia-sabatina',
            default => null
        };

        if (!$eventType) return false;

        $now = Carbon::now();
        
        return Evento::where('clasificacion', $eventType)
            ->where('estado', 'activo')
            ->get()
            ->filter(function ($event) use ($now) {
                $fechaHoraInicio = $this->getFechaHoraInicio($event);
                $fechaHoraFin = $this->getFechaHoraFin($event);
                return $now->between($fechaHoraInicio, $fechaHoraFin);
            })
            ->isNotEmpty();
    }

    private function getFechaHoraInicio(Evento $evento): Carbon
    {
        $fecha = Carbon::parse($evento->fecha_inicio);
        
        if ($evento->hora_inicio) {
            $hora = Carbon::createFromFormat('H:i', $evento->hora_inicio);
            return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(0);
        }
        
        return $fecha->startOfDay(); // 00:00:00 si no hay hora específica
    }

    private function getFechaHoraFin(Evento $evento): Carbon
    {
        $fecha = Carbon::parse($evento->fecha_fin);
        
        if ($evento->hora_fin) {
            $hora = Carbon::createFromFormat('H:i', $evento->hora_fin);
            return $fecha->setHour($hora->hour)->setMinute($hora->minute)->setSecond(59);
        }
        
        return $fecha->endOfDay(); // 23:59:59 si no hay hora específica
    }
}
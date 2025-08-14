<?php

namespace App\Listeners;

use App\Events\AcademicPeriodChanged;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class UpdateSystemAccess
{
    public function handle(AcademicPeriodChanged $event): void
    {
        Log::info("Procesando cambio de período académico", [
            'evento' => $event->evento->nombre,
            'clasificacion' => $event->evento->clasificacion,
            'action' => $event->action
        ]);

        match ($event->evento->clasificacion) {
            'registro-aspirantes' => $this->handleRegistroAspirantes($event),
            'inscripcion' => $this->handleInscripcion($event),
            'examen' => $this->handleExamen($event),
            'academia-sabatina' => $this->handleAcademiaSabatina($event),
            default => Log::info("No hay acciones específicas para: {$event->evento->clasificacion}")
        };
    }

    private function handleRegistroAspirantes(AcademicPeriodChanged $event): void
    {
        $cacheKey = 'registro_aspirantes_activo';
        
        if ($event->action === 'started') {
            Cache::put($cacheKey, true, now()->addDays(30));
            Log::info("Habilitado: Formulario de registro de aspirantes");
        } elseif ($event->action === 'ended') {
            Cache::forget($cacheKey);
            Log::info("Deshabilitado: Formulario de registro de aspirantes");
        }
    }

    private function handleInscripcion(AcademicPeriodChanged $event): void
    {
        $cacheKey = 'inscripcion_activa';
        
        if ($event->action === 'started') {
            Cache::put($cacheKey, true, now()->addDays(30));
            Log::info("Habilitado: Proceso de inscripción");
        } elseif ($event->action === 'ended') {
            Cache::forget($cacheKey);
            Log::info("Deshabilitado: Proceso de inscripción");
        }
    }

    private function handleExamen(AcademicPeriodChanged $event): void
    {
        $cacheKey = 'examen_activo';
        
        if ($event->action === 'started') {
            Cache::put($cacheKey, true, now()->addDays(7));
            Log::info("Habilitado: Período de exámenes");
        } elseif ($event->action === 'ended') {
            Cache::forget($cacheKey);
            Log::info("Deshabilitado: Período de exámenes");
        }
    }

    private function handleAcademiaSabatina(AcademicPeriodChanged $event): void
    {
        $cacheKey = 'academia_sabatina_activa';
        
        if ($event->action === 'started') {
            Cache::put($cacheKey, true, now()->addDays(30));
            Log::info("Habilitado: Academia Sabatina");
        } elseif ($event->action === 'ended') {
            Cache::forget($cacheKey);
            Log::info("Deshabilitado: Academia Sabatina");
        }
    }
}
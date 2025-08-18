<?php

namespace App\Console\Commands;

use App\Events\AcademicPeriodChanged;
use App\Models\Evento;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class CheckAcademicPeriods extends Command
{
    protected $signature = 'academic:check-periods';
    protected $description = 'Verifica y actualiza períodos académicos automáticamente';

    public function handle(): void
    {
        $this->info('Verificando períodos académicos...');
        
        $now = now();
        $today = $now->toDateString();

        // Verificar eventos que empiezan hoy
        $startingEvents = Evento::where('fecha_inicio', $today)
            ->where('estado', 'activo')
            ->get();
            
        foreach ($startingEvents as $event) {
            event(new AcademicPeriodChanged($event, 'started'));
            $this->info("Período iniciado: {$event->nombre}");
        }

        // Verificar eventos que terminan hoy
        $endingEvents = Evento::where('fecha_fin', $today)
            ->where('estado', 'activo')
            ->get();
            
        foreach ($endingEvents as $event) {
            event(new AcademicPeriodChanged($event, 'ended'));
            $this->info("Período terminado: {$event->nombre}");
        }

        // Limpiar cache de eventos inactivos
        $this->cleanInactivePeriodsCache();
        
        $totalChecked = $startingEvents->count() + $endingEvents->count();
        $this->info("Verificación completada. {$totalChecked} eventos procesados.");
    }

    private function cleanInactivePeriodsCache(): void
    {
        $cacheKeys = [
            'registro_aspirantes_activo',
            'inscripcion_activa',
            'examen_activo',
            'academia_sabatina_activa'
        ];

        foreach ($cacheKeys as $key) {
            if (Cache::get($key) && !$this->isPeriodCurrentlyActive($key)) {
                Cache::forget($key);
                $this->warn("🧹 Limpiado cache inactivo: {$key}");
            }
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

        return Evento::where('clasificacion', $eventType)
            ->where('estado', 'activo')
            ->where('fecha_inicio', '<=', now())
            ->where('fecha_fin', '>=', now())
            ->exists();
    }
}
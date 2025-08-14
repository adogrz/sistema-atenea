<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Evento;
use Symfony\Component\HttpFoundation\Response;

class CheckEventPeriod
{
    public function handle(Request $request, Closure $next, string $eventType): Response
    {
        // Primero verificar en cache (actualizado por Events)
        $cacheKey = $this->getCacheKey($eventType);
        $isActiveInCache = Cache::get($cacheKey, null);
        
        if ($isActiveInCache !== null) {
            if (!$isActiveInCache) {
                return $this->deniedResponse($eventType);
            }
            return $next($request);
        }

        // Si no hay cache, verificar en base de datos
        $activeEvent = Evento::where('clasificacion', $eventType)
            ->where('estado', 'activo')
            ->where('fecha_inicio', '<=', now())
            ->where('fecha_fin', '>=', now())
            ->first();

        if (!$activeEvent) {
            return $this->deniedResponse($eventType);
        }

        // Actualizar cache
        Cache::put($cacheKey, true, now()->addHours(1));

        return $next($request);
    }

    private function getCacheKey(string $eventType): string
    {
        return match ($eventType) {
            'registro-aspirantes' => 'registro_aspirantes_activo',
            'inscripcion' => 'inscripcion_activa',
            'examen' => 'examen_activo',
            'academia-sabatina' => 'academia_sabatina_activa',
            default => "{$eventType}_activo"
        };
    }

    private function deniedResponse(string $eventType): Response
    {
        return response()->json([
            'error' => "El período de {$eventType} no está activo actualmente.",
            'redirect' => route('dashboard')
        ], 403);
    }
}
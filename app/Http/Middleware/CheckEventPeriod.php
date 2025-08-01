<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Evento;
use Carbon\Carbon;
use Inertia\Inertia;

class CheckEventPeriod
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $eventType)
    {
        $today = Carbon::now()->toDateString();
        
        // Verificar si hay un evento activo del tipo especificado
        $activeEvent = Evento::where('clasificacion', $eventType)
            ->where('estado', 'activo')
            ->whereDate('fecha_inicio', '<=', $today)
            ->whereDate('fecha_fin', '>=', $today)
            ->first();

        if (!$activeEvent) {
            // Buscar el próximo evento del mismo tipo
            $nextEvent = Evento::where('clasificacion', $eventType)
                ->where('estado', 'activo')
                ->whereDate('fecha_inicio', '>', $today)
                ->orderBy('fecha_inicio', 'asc')
                ->first();

            // Redirigir a página de período cerrado
            return Inertia::render('period-closed', [
                'eventType' => $eventType,
                'nextEvent' => $nextEvent ? [
                    'nombre' => $nextEvent->nombre,
                    'fecha_inicio' => $nextEvent->fecha_inicio,
                    'fecha_fin' => $nextEvent->fecha_fin,
                    'descripcion' => $nextEvent->descripcion,
                ] : null,
            ]);
        }

        // Si hay evento activo, continuar con la request
        return $next($request);
    }
}
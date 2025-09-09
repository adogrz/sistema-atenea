<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Evento;
use Carbon\Carbon;

class CheckEventPeriod
{
    public function handle(Request $request, Closure $next, string $eventType)
    {
        // Buscar el evento activo del tipo especificado
        $evento = Evento::where('clasificacion', $eventType)
            ->where('estado', 'activo')
            ->first();

        if (!$evento) {
            return response()->json([
                'error' => 'No hay un período activo para este tipo de evento',
                'message' => 'El período de ' . $eventType . ' no está disponible en este momento.'
            ], 403);
        }

        // Verificar si estamos dentro del período de fechas
        $now = Carbon::now();
        $fechaHoraInicio = $evento->fecha_hora_inicio;
        $fechaHoraFin = $evento->fecha_hora_fin;

        // Verificar si estamos dentro del período
        if ($now->lt($fechaHoraInicio) || $now->gt($fechaHoraFin)) {
            return response()->json([
                'error' => 'Fuera del período permitido',
                'message' => 'El período de ' . $eventType . ' está programado desde ' . 
                        $fechaHoraInicio->format('d/m/Y H:i') . ' hasta ' . $fechaHoraFin->format('d/m/Y H:i'),
                'periodo' => [
                    'inicio' => $fechaHoraInicio->format('Y-m-d H:i:s'),
                    'fin' => $fechaHoraFin->format('Y-m-d H:i:s'),
                    'actual' => $now->format('Y-m-d H:i:s')
                ]
            ], 403);
        }

        // Verificar horarios específicos si están definidos
        if ($evento->hora_inicio && $evento->hora_fin) {
            $horaActual = $now->format('H:i');
            
            // Si es el día de inicio, verificar que ya haya pasado la hora de inicio
            if ($now->isSameDay($fechaHoraInicio) && $horaActual < $evento->hora_inicio) {
                return response()->json([
                    'error' => 'Aún no ha iniciado el horario',
                    'message' => 'El período de ' . $eventType . ' inicia a las ' . $evento->hora_inicio,
                    'horario' => [
                        'inicio' => $evento->hora_inicio,
                        'fin' => $evento->hora_fin,
                        'actual' => $horaActual
                    ]
                ], 403);
            }
            
            // Si es el día de fin, verificar que no haya pasado la hora de fin
            if ($now->isSameDay($fechaHoraFin) && $horaActual > $evento->hora_fin) {
                return response()->json([
                    'error' => 'Ha finalizado el horario',
                    'message' => 'El período de ' . $eventType . ' finalizó a las ' . $evento->hora_fin,
                    'horario' => [
                        'inicio' => $evento->hora_inicio,
                        'fin' => $evento->hora_fin,
                        'actual' => $horaActual
                    ]
                ], 403);
            }
        }

        // Si llegamos aquí, estamos dentro del período válido
        return $next($request);
    }
}
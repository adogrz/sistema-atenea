<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Evento;
use Carbon\Carbon;
use Inertia\Inertia;

class CheckEventPeriod
{
    public function handle(Request $request, Closure $next, string $eventType)
    {
        // Buscar el evento activo del tipo especificado
        $evento = Evento::where('clasificacion', $eventType)
            ->where('estado', 'activo')
            ->first();

        if (!$evento) {
            $errorData = [
                'eventType' => $eventType,
                'error' => 'No hay un período activo para este tipo de evento',
                'message' => 'El período de ' . $this->getEventTypeName($eventType) . ' no está disponible en este momento.'
            ];
            
            return $this->handlePeriodError($request, $errorData);
        }

        // Verificar si estamos dentro del período de fechas
        $now = Carbon::now();
        $fechaHoraInicio = $evento->fecha_hora_inicio;
        $fechaHoraFin = $evento->fecha_hora_fin;

        // Verificar si estamos dentro del período
        if ($now->lt($fechaHoraInicio) || $now->gt($fechaHoraFin)) {
            $errorData = [
                'eventType' => $eventType,
                'error' => 'Fuera del período permitido',
                'message' => 'El período de ' . $this->getEventTypeName($eventType) . ' está programado desde ' . 
                          $fechaHoraInicio->format('d/m/Y H:i') . ' hasta ' . $fechaHoraFin->format('d/m/Y H:i'),
                'periodo' => [
                    'inicio' => $fechaHoraInicio->format('Y-m-d H:i:s'),
                    'fin' => $fechaHoraFin->format('Y-m-d H:i:s'),
                    'actual' => $now->format('Y-m-d H:i:s')
                ]
            ];
            
            return $this->handlePeriodError($request, $errorData);
        }

        // Verificar horarios específicos si están definidos
        if ($evento->hora_inicio && $evento->hora_fin) {
            $horaActual = $now->format('H:i');
            
            // Si es el día de inicio, verificar que ya haya pasado la hora de inicio
            if ($now->isSameDay($fechaHoraInicio) && $horaActual < $evento->hora_inicio) {
                $errorData = [
                    'eventType' => $eventType,
                    'error' => 'Aún no ha iniciado el horario',
                    'message' => 'El período de ' . $this->getEventTypeName($eventType) . ' inicia a las ' . $evento->hora_inicio,
                    'horario' => [
                        'inicio' => $evento->hora_inicio,
                        'fin' => $evento->hora_fin,
                        'actual' => $horaActual
                    ]
                ];
                
                return $this->handlePeriodError($request, $errorData);
            }
            
            // Si es el día de fin, verificar que no haya pasado la hora de fin
            if ($now->isSameDay($fechaHoraFin) && $horaActual > $evento->hora_fin) {
                $errorData = [
                    'eventType' => $eventType,
                    'error' => 'Ha finalizado el horario',
                    'message' => 'El período de ' . $this->getEventTypeName($eventType) . ' finalizó a las ' . $evento->hora_fin,
                    'horario' => [
                        'inicio' => $evento->hora_inicio,
                        'fin' => $evento->hora_fin,
                        'actual' => $horaActual
                    ]
                ];
                
                return $this->handlePeriodError($request, $errorData);
            }
        }

        // Si llegamos aquí, estamos dentro del período válido
        return $next($request);
    }

    private function handlePeriodError(Request $request, array $errorData)
    {
        // Si es una petición AJAX/API o tiene el header X-Requested-With: XMLHttpRequest
        if ($request->expectsJson() || 
            $request->is('api/*') || 
            $request->header('X-Requested-With') === 'XMLHttpRequest' ||
            $request->header('Accept') === 'application/json') {
            return response()->json($errorData, 403);
        }
        abort(403, $errorData['message']);

        // Si es una petición web normal, mostrar la página completa
        return Inertia::render('period-closed', $errorData)->toResponse($request)->setStatusCode(403);
    }

    private function getEventTypeName(string $eventType): string
    {
        $types = [
            'registro-aspirantes' => 'Registro de Aspirantes',
            'inscripcion' => 'Inscripción',
            'academia-sabatina' => 'Academia Sabatina',
            'fin-de-mes' => 'Fin de Mes',
            'fdtc' => 'FDTC',
            'fin-de-semana' => 'Fin de Semana',
            'examen' => 'Examen',
            'graduacion' => 'Graduación'
        ];

        return $types[$eventType] ?? ucfirst(str_replace('-', ' ', $eventType));
    }
}
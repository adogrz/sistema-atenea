<?php

namespace App\Listeners;

use App\Events\AcademicPeriodChanged;
use Illuminate\Support\Facades\Log;

class SendPeriodNotifications
{
    public function handle(AcademicPeriodChanged $event): void
    {
        $message = $event->action === 'started' 
            ? "Ha iniciado el período: {$event->evento->nombre}"
            : "Ha finalizado el período: {$event->evento->nombre}";

        // Aquí puedes implementar notificaciones reales
        // Por ahora solo log
        Log::info("Notificación enviada: {$message}");
        
        // TODO: Implementar envío real de notificaciones
        // - Email a administradores
        // - Notificaciones push
        // - Alertas en el sistema
    }
}
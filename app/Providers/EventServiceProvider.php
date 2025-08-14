<?php

namespace App\Providers;

use App\Events\AcademicPeriodChanged;
use App\Listeners\UpdateSystemAccess;
use App\Listeners\SendPeriodNotifications;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        // Eventos académicos
        AcademicPeriodChanged::class => [
            UpdateSystemAccess::class,        // Actualizar accesos del sistema
            SendPeriodNotifications::class,   // Enviar notificaciones
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
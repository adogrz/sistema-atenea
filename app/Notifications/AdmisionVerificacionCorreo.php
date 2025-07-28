<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class AdmisionVerificacionCorreo extends Notification implements ShouldQueue
{
    use Queueable;
    private $usuario;
    private $linkVerificacion;

    /**
     * Create a new notification instance.
     */
    public function __construct() {
       
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage {
        return (new MailMessage)
            ->subject('Confirma tu correo')
            ->greeting('Hola ' . $notifiable->name)
            ->line('Gracias por registrarte. Por favor confirma tu correo.')
            ->action('Verificar ahora', $notifiable->linkVerificacion)
            ->line('Si no creaste esta cuenta, ignora este mensaje.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}

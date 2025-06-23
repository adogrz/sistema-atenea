<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseNotification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseNotification
{
    /**
     * Get the reset password notification mail message for the given URL.
     */
    protected function buildMailMessage($url)
    {
        return (new MailMessage)
            ->subject('Restablecer contraseña')
            ->markdown('emails.reset-password', ['url' => $url]);
    }
}

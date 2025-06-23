<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseNotification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseNotification
{
    /****
     * Constructs the password reset email message using a custom subject and Markdown template.
     *
     * @param string $url The password reset URL to include in the email.
     * @return \Illuminate\Notifications\Messages\MailMessage The configured mail message instance.
     */
    protected function buildMailMessage($url)
    {
        return (new MailMessage)
            ->subject('Restablecer contraseña')
            ->markdown('emails.reset-password', ['url' => $url]);
    }
}

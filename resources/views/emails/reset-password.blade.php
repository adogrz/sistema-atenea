@component('mail::message')
# Hola

Recibiste este correo porque solicitaste restablecer tu contraseña en **{{ config('app.name') }}**.

@component('mail::button', ['url' => $url])
Restablecer contraseña
@endcomponent

Si no solicitaste este correo, puedes ignorarlo.

Saludos,<br>
{{ config('app.name') }}
@endcomponent

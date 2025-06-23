@component('mail::message')
<div style="text-align: center; margin-bottom: 16px;">
    <img src="{{ asset('logo.svg') }}" alt="{{ config('app.name') }}" style="max-width: 160px; height: auto;">
</div>

# Hola

Recibiste este correo porque solicitaste restablecer tu contraseña en **{{ config('app.name') }}**.

@component('mail::button', ['url' => $url])
Restablecer contraseña
@endcomponent

Si no solicitaste este correo, puedes ignorarlo.

Saludos,<br>
{{ config('app.name') }}
@endcomponent

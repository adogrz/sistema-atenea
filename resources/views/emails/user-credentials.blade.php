@component('mail::message')
# {{ trans('mail.welcome_greeting', ['name' => $userName]) }}

{{ trans('mail.welcome_intro') }}

{{ trans('mail.welcome_credentials_intro') }}

{{ trans('mail.welcome_user', ['email' => $userEmail]) }}

{{ trans('mail.welcome_password', ['password' => $password]) }}

@component('mail::button', ['url' => $loginUrl])
{{ trans('mail.welcome_action') }}
@endcomponent

{{ trans('mail.welcome_security_recommendation') }}

{{ trans('mail.welcome_salutation') }}
@endcomponent

@component('mail::message')
# {{ __('mail.reset_password_greeting') }}

{{ __('mail.reset_password_intro', ['app' => config('app.name')]) }}

@component('mail::button', ['url' => $url])
{{ __('mail.reset_password_action') }}
@endcomponent

{{ __('mail.reset_password_footer') }}

---

{{ __('mail.reset_password_extra') }}

{{ __('mail.reset_password_regards') }},<br>
{{ config('app.name') }}
@endcomponent

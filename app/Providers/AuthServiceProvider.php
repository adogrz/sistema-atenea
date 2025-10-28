<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Olimpiada;
use App\Policies\UserPolicy;
use App\Policies\OlimpiadaPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Aquí es donde registramos nuestras políticas
        User::class => UserPolicy::class,
        Olimpiada::class => OlimpiadaPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

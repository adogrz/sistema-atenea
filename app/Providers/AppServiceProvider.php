<?php

namespace App\Providers;

use App\Models\InscripcionOlimpiada;
use App\Observers\InscripcionOlimpiadaObserver;
use App\Services\RoleAssignmentService;
use App\Services\UserVisibilityService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(UserVisibilityService::class, function () {
            return new UserVisibilityService();
        });

        $this->app->singleton(RoleAssignmentService::class, function () {
            return new RoleAssignmentService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

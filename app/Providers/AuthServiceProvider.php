<?php

namespace App\Providers;

use App\Models\Assignment;
use App\Models\MedicalRecord;
use App\Models\User;
use App\Policies\AssignmentPolicy;
use App\Policies\MedicalRecordPolicy;
use App\Policies\UserPolicy;
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
        Assignment::class => AssignmentPolicy::class,
        MedicalRecord::class => MedicalRecordPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

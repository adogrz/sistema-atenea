<?php

namespace App\Providers;

use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\MedicalRecord;
use App\Models\User;
use App\Policies\ClinicalRecord\AssignmentPolicy;
use App\Policies\ClinicalRecord\MedicalRecordPolicy;
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

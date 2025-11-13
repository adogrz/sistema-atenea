<?php

namespace App\Providers;

use App\Models\ClinicalRecord\Assignment;
use App\Models\ClinicalRecord\ConsentForm;
use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\ClinicalRecord\MedicalRecord;
use App\Models\ClinicalRecord\PsychologicalRecord;
use App\Models\User;
use App\Policies\ClinicalRecord\AssignmentPolicy;
use App\Policies\ClinicalRecord\ConsentFormPolicy;
use App\Policies\ClinicalRecord\MedicalConsultationPolicy;
use App\Policies\ClinicalRecord\MedicalRecordPolicy;
use App\Policies\ClinicalRecord\PsychologicalRecordPolicy;
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
        MedicalConsultation::class => MedicalConsultationPolicy::class,
        PsychologicalRecord::class => PsychologicalRecordPolicy::class,
        ConsentForm::class => ConsentFormPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

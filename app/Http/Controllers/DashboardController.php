<?php

namespace App\Http\Controllers;

use App\Services\DashboardStatsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardStatsService $dashboardStatsService
    ) {}

    /**
     * Display the dashboard based on user role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Determinar el tipo de dashboard según los roles del usuario
        $dashboardType = $this->determineDashboardType($user);

        // Obtener datos específicos según el tipo de dashboard
        $dashboardData = $this->getDashboardData($user, $dashboardType);

        return Inertia::render('dashboard', [
            'dashboard_type' => $dashboardType,
            'dashboard_data' => $dashboardData,
        ]);
    }

    /**
     * Determina qué tipo de dashboard mostrar según los roles del usuario.
     */
    private function determineDashboardType($user): string
    {
        // Prioridad: Jefe médico > Jefe psicológico > Doctor > Psicólogo > Otros
        if ($user->hasRole('jefe-medicina')) {
            return 'medical-manager';
        }

        if ($user->hasRole('jefe-psicologia')) {
            return 'psychological-manager';
        }

        if ($user->hasRole('doctor')) {
            return 'doctor';
        }

        if ($user->hasRole('psicologo')) {
            return 'psychologist';
        }

        return 'welcome';
    }

    /**
     * Obtiene los datos del dashboard según el tipo.
     */
    private function getDashboardData($user, string $dashboardType): ?array
    {
        return match ($dashboardType) {
            'medical-manager' => $this->dashboardStatsService->getMedicalManagerStats($user),
            'psychological-manager' => $this->dashboardStatsService->getPsychologicalManagerStats($user),
            'doctor' => $this->dashboardStatsService->getDoctorStats($user),
            'psychologist' => $this->dashboardStatsService->getPsychologistStats($user),
            default => null,
        };
    }
}

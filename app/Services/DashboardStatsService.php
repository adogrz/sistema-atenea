<?php

namespace App\Services;

use App\Models\ClinicalRecord\MedicalConsultation;
use App\Models\ClinicalRecord\MedicalRecord;
use App\Models\ClinicalRecord\PsychologicalRecord;
use App\Models\ClinicalRecord\PsychologicalSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardStatsService
{
    /**
     * Obtiene las estadísticas para el dashboard de un jefe médico.
     */
    public function getMedicalManagerStats(User $user): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        return [
            'total_records' => MedicalRecord::count(),
            'consultations_this_month' => MedicalConsultation::whereYear('consultation_date', $currentYear)
                ->whereMonth('consultation_date', $currentMonth)
                ->count(),
            'professionals_count' => User::role('doctor')->count(),
            'recent_records' => MedicalRecord::with(['student', 'creator'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($record) => [
                    'id' => $record->id,
                    'student_name' => $record->student->primer_nombre.' '.$record->student->primer_apellido,
                    'student_nie' => $record->student->nie,
                    'doctor_name' => $record->creator->name ?? 'N/A',
                    'created_at' => $record->created_at->format('d/m/Y'),
                    'consultations_count' => $record->medicalConsultations()->count(),
                ]),
            'monthly_consultations' => $this->getMedicalMonthlyStats(),
        ];
    }

    /**
     * Obtiene las estadísticas para el dashboard de un jefe de psicología.
     */
    public function getPsychologicalManagerStats(User $user): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        return [
            'total_records' => PsychologicalRecord::count(),
            'sessions_this_month' => PsychologicalSession::whereYear('session_date', $currentYear)
                ->whereMonth('session_date', $currentMonth)
                ->count(),
            'professionals_count' => User::role('psicologo')->count(),
            'recent_records' => PsychologicalRecord::with(['student', 'creator'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($record) => [
                    'id' => $record->id,
                    'student_name' => $record->student->primer_nombre.' '.$record->student->primer_apellido,
                    'student_nie' => $record->student->nie,
                    'psychologist_name' => $record->creator->name ?? 'N/A',
                    'created_at' => $record->created_at->format('d/m/Y'),
                    'sessions_count' => $record->psychologicalSessions()->count(),
                ]),
            'monthly_sessions' => $this->getPsychologicalMonthlyStats(),
        ];
    }

    /**
     * Obtiene las estadísticas para el dashboard de un doctor.
     */
    public function getDoctorStats(User $doctor): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $assignedStudents = $doctor->medicalAssignments()
            ->with(['student'])
            ->get();

        return [
            'assigned_students' => $assignedStudents->count(),
            'consultations_this_month' => MedicalConsultation::where('doctor_id', $doctor->id)
                ->whereYear('consultation_date', $currentYear)
                ->whereMonth('consultation_date', $currentMonth)
                ->count(),
            'my_assignments' => $assignedStudents->map(function ($assignment) {
                $medicalRecord = MedicalRecord::where('student_nie', $assignment->student_nie)->first();
                $lastConsultation = $medicalRecord
                    ? $medicalRecord->medicalConsultations()->latest('consultation_date')->first()
                    : null;

                return [
                    'id' => $assignment->id,
                    'student_nie' => $assignment->student->nie,
                    'student_name' => $assignment->student->primer_nombre.' '.$assignment->student->primer_apellido,
                    'has_record' => $medicalRecord !== null,
                    'record_id' => $medicalRecord?->id,
                    'assigned_at' => $assignment->created_at->format('d/m/Y'),
                    'last_consultation' => $lastConsultation?->consultation_date?->format('d/m/Y'),
                ];
            })->take(10),
        ];
    }

    /**
     * Obtiene las estadísticas para el dashboard de un psicólogo.
     */
    public function getPsychologistStats(User $psychologist): array
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $assignedStudents = $psychologist->psychologicalAssignments()
            ->with(['student'])
            ->get();

        return [
            'assigned_students' => $assignedStudents->count(),
            'sessions_this_month' => PsychologicalSession::where('psychologist_id', $psychologist->id)
                ->whereYear('session_date', $currentYear)
                ->whereMonth('session_date', $currentMonth)
                ->count(),
            'my_assignments' => $assignedStudents->map(function ($assignment) {
                $psychologicalRecord = PsychologicalRecord::where('student_nie', $assignment->student_nie)->first();
                $lastSession = $psychologicalRecord
                    ? $psychologicalRecord->psychologicalSessions()->latest('session_date')->first()
                    : null;

                return [
                    'id' => $assignment->id,
                    'student_nie' => $assignment->student->nie,
                    'student_name' => $assignment->student->primer_nombre.' '.$assignment->student->primer_apellido,
                    'has_record' => $psychologicalRecord !== null,
                    'record_id' => $psychologicalRecord?->id,
                    'assigned_at' => $assignment->created_at->format('d/m/Y'),
                    'last_session' => $lastSession?->session_date?->format('d/m/Y'),
                ];
            })->take(10),
        ];
    }

    /**
     * Obtiene las estadísticas mensuales de consultas médicas (últimos 6 meses).
     */
    private function getMedicalMonthlyStats(): array
    {
        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();

        // Obtener todas las consultas de los últimos 6 meses
        $consultations = MedicalConsultation::where('consultation_date', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(function ($consultation) {
                return Carbon::parse($consultation->consultation_date)->format('Y-m');
            })
            ->map(function ($group) {
                return $group->count();
            });

        // Generar todos los meses (últimos 6) para asegurar continuidad
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = ucfirst($date->locale('es')->isoFormat('MMMM'));

            $count = $consultations->get($monthKey, 0);

            $months->push([
                'month' => $monthName,
                'count' => $count,
            ]);
        }

        return $months->toArray();
    }

    /**
     * Obtiene las estadísticas mensuales de sesiones psicológicas (últimos 6 meses).
     */
    private function getPsychologicalMonthlyStats(): array
    {
        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();

        // Obtener todas las sesiones de los últimos 6 meses
        $sessions = PsychologicalSession::where('session_date', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(function ($session) {
                return Carbon::parse($session->session_date)->format('Y-m');
            })
            ->map(function ($group) {
                return $group->count();
            });

        // Generar todos los meses (últimos 6) para asegurar continuidad
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = ucfirst($date->locale('es')->isoFormat('MMMM'));

            $count = $sessions->get($monthKey, 0);

            $months->push([
                'month' => $monthName,
                'count' => $count,
            ]);
        }

        return $months->toArray();
    }
}

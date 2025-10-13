<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Estudiante;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestAssignmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener los profesionales
        $doctor1 = User::where('email', 'doctor1@atenea.com')->first();
        $doctor2 = User::where('email', 'doctor2@atenea.com')->first();
        $psicologo1 = User::where('email', 'psicologo1@atenea.com')->first();
        $psicologo2 = User::where('email', 'psicologo2@atenea.com')->first();

        // Verificar que existan los profesionales
        if (!$doctor1 || !$doctor2 || !$psicologo1 || !$psicologo2) {
            $this->command->error("❌ Error: No se encontraron los profesionales. Ejecuta primero: php artisan db:seed --class=TestProfessionalsSeeder");
            return;
        }

        // Obtener estudiantes de prueba
        $estudiantes = Estudiante::whereIn('nie', ['12345678', '87654321', '11223344'])->get();

        if ($estudiantes->count() < 3) {
            $this->command->error("❌ Error: No se encontraron suficientes estudiantes de prueba. Ejecuta primero: php artisan db:seed --class=TestStudentsSeeder");
            return;
        }

        $asignaciones = [];

        // Asignación 1: Estudiante 1 - Doctor 1 (Activa)
        $asignaciones[] = Assignment::updateOrCreate(
            [
                'student_nie' => $estudiantes[0]->nie,
                'type' => Assignment::TYPE_MEDICAL,
            ],
            [
                'professional_id' => $doctor1->id,
                'is_active' => true,
                'change_justification' => null,
            ]
        );

        // Asignación 2: Estudiante 1 - Psicólogo 1 (Activa)
        $asignaciones[] = Assignment::updateOrCreate(
            [
                'student_nie' => $estudiantes[0]->nie,
                'type' => Assignment::TYPE_PSYCHOLOGICAL,
            ],
            [
                'professional_id' => $psicologo1->id,
                'is_active' => true,
                'change_justification' => null,
            ]
        );

        // Asignación 3: Estudiante 2 - Doctor 2 (Activa)
        $asignaciones[] = Assignment::updateOrCreate(
            [
                'student_nie' => $estudiantes[1]->nie,
                'type' => Assignment::TYPE_MEDICAL,
            ],
            [
                'professional_id' => $doctor2->id,
                'is_active' => true,
                'change_justification' => null,
            ]
        );

        // Asignación 4: Estudiante 2 - Psicólogo 2 (Activa)
        $asignaciones[] = Assignment::updateOrCreate(
            [
                'student_nie' => $estudiantes[1]->nie,
                'type' => Assignment::TYPE_PSYCHOLOGICAL,
            ],
            [
                'professional_id' => $psicologo2->id,
                'is_active' => true,
                'change_justification' => null,
            ]
        );

        // Asignación 5: Estudiante 3 - Doctor 1 (Activa)
        $asignaciones[] = Assignment::updateOrCreate(
            [
                'student_nie' => $estudiantes[2]->nie,
                'type' => Assignment::TYPE_MEDICAL,
            ],
            [
                'professional_id' => $doctor1->id,
                'is_active' => true,
                'change_justification' => null,
            ]
        );

        // Asignación 6: Estudiante 3 - Psicólogo 1 (Inactiva - ejemplo de cambio)
        $asignaciones[] = Assignment::updateOrCreate(
            [
                'student_nie' => $estudiantes[2]->nie,
                'type' => Assignment::TYPE_PSYCHOLOGICAL,
            ],
            [
                'professional_id' => $psicologo1->id,
                'is_active' => false,
                'change_justification' => 'El estudiante solicitó cambio de profesional por incompatibilidad de horarios.',
            ]
        );

        $this->command->info("\n✅ Se han creado/actualizado " . count($asignaciones) . " asignaciones:");
        $this->command->info("- Estudiante 1 (NIE: {$estudiantes[0]->nie}):");
        $this->command->info("  • Médica: Dr. Carlos Martínez (Activa)");
        $this->command->info("  • Psicológica: Lic. Ana Rodríguez (Activa)");
        $this->command->info("- Estudiante 2 (NIE: {$estudiantes[1]->nie}):");
        $this->command->info("  • Médica: Dra. María González (Activa)");
        $this->command->info("  • Psicológica: Lic. Roberto Flores (Activa)");
        $this->command->info("- Estudiante 3 (NIE: {$estudiantes[2]->nie}):");
        $this->command->info("  • Médica: Dr. Carlos Martínez (Activa)");
        $this->command->info("  • Psicológica: Lic. Ana Rodríguez (Inactiva - con justificación)");
        $this->command->info("\n🎉 Datos de prueba creados exitosamente.");
    }
}

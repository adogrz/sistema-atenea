<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestProfessionalsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Doctor - Sede Central
        $doctor1 = User::updateOrCreate(
            ['email' => 'doctor1@atenea.com'],
            [
                'name' => 'Dr. Carlos Martínez',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'central',
                'status' => 'active',
            ]
        );
        $doctor1->syncRolesWithExpiration([
            ['name' => 'doctor', 'is_primary' => true, 'expires_at' => null],
        ]);

        // 2. Doctor - Sede Central
        $doctor2 = User::updateOrCreate(
            ['email' => 'doctor2@atenea.com'],
            [
                'name' => 'Dra. María González',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'central',
                'status' => 'active',
            ]
        );
        $doctor2->syncRolesWithExpiration([
            ['name' => 'doctor', 'is_primary' => true, 'expires_at' => null],
        ]);

        // 3. Psicólogo - Sede Central
        $psicologo1 = User::updateOrCreate(
            ['email' => 'psicologo1@atenea.com'],
            [
                'name' => 'Lic. Ana Rodríguez',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'central',
                'status' => 'active',
            ]
        );
        $psicologo1->syncRolesWithExpiration([
            ['name' => 'psicologo', 'is_primary' => true, 'expires_at' => null],
        ]);

        // 4. Psicólogo - Sede Central
        $psicologo2 = User::updateOrCreate(
            ['email' => 'psicologo2@atenea.com'],
            [
                'name' => 'Lic. Roberto Flores',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'central',
                'status' => 'active',
            ]
        );
        $psicologo2->syncRolesWithExpiration([
            ['name' => 'psicologo', 'is_primary' => true, 'expires_at' => null],
        ]);

        // 5. Doctor - Sede Occidental
        $doctor3 = User::updateOrCreate(
            ['email' => 'doctor3@atenea.com'],
            [
                'name' => 'Dr. Luis Hernández',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'occidental',
                'status' => 'active',
            ]
        );
        $doctor3->syncRolesWithExpiration([
            ['name' => 'doctor', 'is_primary' => true, 'expires_at' => null],
        ]);

        // 6. Psicólogo - Sede Oriental
        $psicologo3 = User::updateOrCreate(
            ['email' => 'psicologo3@atenea.com'],
            [
                'name' => 'Lic. Patricia Vásquez',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'oriental',
                'status' => 'active',
            ]
        );
        $psicologo3->syncRolesWithExpiration([
            ['name' => 'psicologo', 'is_primary' => true, 'expires_at' => null],
        ]);

        $this->command->info("\n🎉 Se han creado 6 profesionales de prueba.");
        $this->command->info("Doctores: 3 (2 en central, 1 en occidental)");
        $this->command->info("Psicólogos: 3 (2 en central, 1 en oriental)");
        $this->command->info("Contraseña para todos: password123");
    }
}

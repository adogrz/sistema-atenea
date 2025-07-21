<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EssentialUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // 1. Usuario Administrador de TI
        $adminTI = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin TI',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $adminTI->assignRole('admin-ti');

        // 2. Usuario Jefe de Psicología
        $jefePsicologia = User::updateOrCreate(
            ['email' => 'jefe.psicologia@atenea.com'],
            [
                'name' => 'Jefe de Psicología',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $jefePsicologia->assignRole('jefe-psicologia');

        // 3. Usuario Jefe de Medicina
        $jefeMedicina = User::updateOrCreate(
            ['email' => 'jefe.medicina@atenea.com'],
            [
                'name' => 'Jefe de Medicina',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $jefeMedicina->assignRole('jefe-medicina');
    }
}

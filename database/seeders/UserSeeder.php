<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // // Crear el usuario Administrador de Pruebas
        $adminPruebas = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@pruebas.com',
            'password' => bcrypt('password123'),
            'sede_name' => 'central',
            'status' => 'active',
        ]);

        // Asignar el rol 'admin-ti' como primario y sin expiración
        $adminPruebas->syncRolesWithExpiration([
            ['name' => 'admin-ti', 'is_primary' => true, 'expires_at' => null],
        ]);

        // Crear el usuario Jefe de Psicología
        $jefePsicologia = User::create([
            'name' => 'Dr. House',
            'email' => 'house@pruebas.com',
            'password' => bcrypt('password123'),
            'sede_name' => 'central',
            'status' => 'active',
        ]);

        // Asignar el rol 'jefe-psicologia' como primario y sin expiración
        $jefePsicologia->syncRolesWithExpiration([
            ['name' => 'jefe-psicologia', 'is_primary' => true, 'expires_at' => null],
        ]);

        // Crear el usuario Jefe de Medicina
        $jefeMedicina = User::create([
            'name' => 'Dr. Strange',
            'email' => 'strange@pruebas.com',
            'password' => bcrypt('password123'),
            'sede_name' => 'central',
            'status' => 'active',
        ]);

        // Asignar el rol 'jefe-medicina' como primario y sin expiración
        $jefeMedicina->syncRolesWithExpiration([
            ['name' => 'jefe-medicina', 'is_primary' => true, 'expires_at' => null],
        ]);
    }
}

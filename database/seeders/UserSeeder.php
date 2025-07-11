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
        // Crear el usuario Administrador de Pruebas
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
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Sedes de la institucion
        $this->call(SedeSeeder::class);
        //Permisos y roles (Spatie)
        $this->call(PermissionSeeder::class);

        // Crear el usuario con rol de Administrador
        $user = User::firstOrCreate(
            ['email' => 'admin@pruebas.com'],
            [
                'name' => 'Administrador de Pruebas',
                'password' => Hash::make('password123'),
                'role_name' => 1,
                'sede_name' => 1,
            ]
        );

        $user->assignRole("admin");
    }
}

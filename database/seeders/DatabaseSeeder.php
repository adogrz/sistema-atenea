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
        $this->call([
            SedeSeeder::class,
            PermissionSeeder::class,
            DepartamentosSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
        ]);

        // Crear el usuario con rol de Administrador
        $user = User::firstOrCreate(
            ['email' => 'admin@pruebas.com'],
            [
                'name' => 'Administrador de Pruebas',
                'password' => Hash::make('password123'),
                'role_name' => 'admin',
                'sede_name' => 'central',
                'status' => 'active',
                'deleted_at' => null,
            ]
        );

        $user->assignRole("admin");

        // Usuarios aleatorios con roles
        User::factory(100)->create()->each(function ($user) {
            $user->assignRole($user->role_name);
        });
    }
}

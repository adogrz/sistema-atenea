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
        // 1. Primero los permisos y roles (Spatie)
        $this->call(PermissionSeeder::class);

        // Crear el usuario con rol de Administrador
        $user = User::firstOrCreate(
            ['email' => 'admin@pruebas.com'],
            [
                'name' => 'Administrador de Pruebas',
                'password' => Hash::make('password123'),
            ]
        );

        $user->assignRole("Administrador");
    }
}

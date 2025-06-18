<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // ✅ Importación necesaria
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            'Director',
            'Administrador',
            'Administrador Académico',
            'Administrador Académico de Sede',
            'Coordinador de Área',
            'Jefe de Psicología',
            'Psicólogo',
            'Doctor Jefe',
            'Doctor',
            'Mentor',
            'Instructor',
            'Calificador',
            'Estudiante',
            'Aspirante',
        ];

        // Crear los roles si no existen
        foreach ($roles as $rol) {
            Role::firstOrCreate(['name' => $rol]);
        }

        // Crear el usuario con rol de Administrador
        $role = Role::firstOrCreate(['name' => 'Administrador']);

        /*$user = User::firstOrCreate(
            ['email' => 'admin@pruebas.com'],
            [
                'name' => 'Administrador de Pruebas',
                'password' => Hash::make('password123'),
            ]
        );*/

        $user->assignRole($role);
    }
}

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
        // Crear el usuario Super Administrador
        $superAdmin = User::create([
            'name' => 'Super Administrador',
            'email' => 'superadmin@atenea.com',
            'password' => bcrypt('superadmin'),
            'sede_name' => 'central',
            'status' => 'active',
        ]);
        $superAdmin->assignRole('super-admin');

        // Crear el usuario Administrador de Pruebas
        $adminPruebas = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@pruebas.com',
            'password' => bcrypt('password123'),
            'sede_name' => 'central',
            'status' => 'active',
        ]);
        $adminPruebas->assignRole('admin-ti');

        // Roles que se pueden asignar aleatoriamente a los usuarios de prueba
        $roles = ['estudiante', 'instructor', 'mentor', 'calificador', 'psicologo', 'doctor', 'admin-academico-sede', 'coordinador-area'];

        // Usuarios aleatorios con roles
        User::factory(100)->create()->each(function ($user) use ($roles) {
            // Asignar un rol aleatorio de la lista
            $user->assignRole(fake()->randomElement($roles));
        });
    }
}

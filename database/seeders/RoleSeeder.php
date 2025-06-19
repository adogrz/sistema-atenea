<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;


class RoleSeeder extends Seeder
{
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

        foreach ($roles as $rol) {
            Role::firstOrCreate(['name' => $rol]);
        }
    }
}

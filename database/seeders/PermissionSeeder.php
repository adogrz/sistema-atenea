<?php

namespace Database\Seeders;


use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset permissions and roles
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Creacion de permissos

        $createUsers = Permission::created(['name' => 'create users']);

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

        $role = Role::findById(1);
        $role -> givePermissionTo($createUsers);
    }
}

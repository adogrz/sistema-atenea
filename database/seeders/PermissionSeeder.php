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
        // Reset cached permissions and roles
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Creación de permisos
        $permissions = [
            'create users',
            'edit users',
            'delete users',
            'view users',
            // Agrega más permisos según necesites
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Definición de roles con sus descripciones
        $roles = [
            'director' => 'Director',
            'admin' => 'Administrador',
            'admin_academic' => 'Administrador Académico',
            'admin_academic_sede' => 'Administrador Académico de Sede',
            'coordinator_area' => 'Coordinador de Área',
            'jefe_psicologia' => 'Jefe de Psicología',
            'psicologo' => 'Psicólogo',
            'doctor_jefe' => 'Doctor Jefe',
            'doctor' => 'Doctor',
            'mentor' => 'Mentor',
            'instructor' => 'Instructor',
            'calificador' => 'Calificador',
            'estudiante' => 'Estudiante',
            'aspirante' => 'Aspirante',
        ];

        // Crear los roles con descripción
        foreach ($roles as $key => $description) {
            Role::firstOrCreate(
                ['name' => $key],
                ['description' => $description]
            );
        }

        // Asignar permisos al rol de administrador
        $admin = Role::findByName('admin');
        $admin->givePermissionTo(Permission::all());

        // Asignar permisos específicos a otros roles si es necesario
        $director = Role::findByName('director');
        $director->givePermissionTo(['create users', 'edit users', 'view users']);
    }
}
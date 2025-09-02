<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Direccion;

class TestStudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar que el rol existe
        $estudianteRole = DB::table('roles')->where('name', 'estudiante')->first();
        if (!$estudianteRole) {
            echo "❌ Error: No existe el rol 'estudiante'. Ejecuta primero: php artisan db:seed --class=RoleSeeder\n";
            return;
        }

        $students = [
            [
                'email' => 'estudiante.test1@atenea.com',
                'name' => 'Juan Carlos Pérez López',
                'primer_nombre' => 'Juan',
                'segundo_nombre' => 'Carlos',
                'primer_apellido' => 'Pérez',
                'segundo_apellido' => 'López',
                'nie' => '12345678',
                'telefono_estudiante' => '71234567',
                'telefono_casa' => '22345678',
                'sexo' => 'H',
                'fecha_nacimiento' => '2005-03-15',
                'centro_educativo' => '10001', // CENTRO ESCOLAR  "ISIDRO MENÉNDEZ"
                'direccion_data' => [
                    'colonia' => 'Col. Escalón',
                    'calle' => 'Pasaje 3',
                    'numero_casa' => '25',
                    'distrito_id' => 1,
                ],
                'nivel_educativo' => 'n6', // Primero de Bachillerato
            ],
            [
                'email' => 'estudiante.test2@atenea.com',
                'name' => 'María Elena Rodríguez García',
                'primer_nombre' => 'María',
                'segundo_nombre' => 'Elena',
                'primer_apellido' => 'Rodríguez',
                'segundo_apellido' => 'García',
                'nie' => '87654321',
                'telefono_estudiante' => '79876543',
                'telefono_casa' => '23456789',
                'sexo' => 'M',
                'fecha_nacimiento' => '2006-07-22',
                'centro_educativo' => '10002', // CENTRO ESCOLAR "ALFREDO ESPINO"
                'direccion_data' => [
                    'colonia' => 'Col. Miramonte',
                    'calle' => 'Av. Principal',
                    'numero_casa' => '123',
                    'distrito_id' => 2,
                ],
                'nivel_educativo' => 'n7', // Segundo de Bachillerato
            ],
            [
                'email' => 'estudiante.test3@atenea.com',
                'name' => 'Luis Alberto Martínez Flores',
                'primer_nombre' => 'Luis',
                'segundo_nombre' => 'Alberto',
                'primer_apellido' => 'Martínez',
                'segundo_apellido' => 'Flores',
                'nie' => '11223344',
                'telefono_estudiante' => '74567890',
                'telefono_casa' => '25678901',
                'sexo' => 'H',
                'fecha_nacimiento' => '2005-11-08',
                'centro_educativo' => '10003', // CENTRO ESCOLAR "ALEJANDRO DE HUMBOLDT"
                'direccion_data' => [
                    'colonia' => 'Col. San Benito',
                    'calle' => 'Calle Los Naranjos',
                    'numero_casa' => '456',
                    'distrito_id' => 3,
                ],
                'nivel_educativo' => 'n5', // Noveno Grado
            ],
        ];

        foreach ($students as $index => $studentData) {
            // Verificar si ya existe un usuario con este email (excluyendo soft-deleted)
            $existingUser = DB::table('users')->where('email', $studentData['email'])->whereNull('deleted_at')->first();
            if ($existingUser) {
                echo "⚠️ Usuario ya existe: {$studentData['email']}, omitiendo...\n";
                continue;
            }

            // Verificar si ya existe un estudiante con este NIE (excluyendo soft-deleted)
            $existingStudent = DB::table('estudiantes')->where('nie', $studentData['nie'])->whereNull('deleted_at')->first();
            if ($existingStudent) {
                echo "⚠️ NIE ya existe: {$studentData['nie']}, omitiendo...\n";
                continue;
            }

            // Crear usuario
            $userId = DB::table('users')->insertGetId([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'password' => Hash::make('password123'), // Contraseña de prueba
                'sede_name' => 'central', // Sede válida
                'status' => 'active',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Generar código único para el estudiante
            $codigo = 'EST' . str_pad($index + 1, 6, '0', STR_PAD_LEFT);

            // Crear dirección para el estudiante
            $direccion = Direccion::create($studentData['direccion_data']);

            // Crear estudiante
            $estudianteId = DB::table('estudiantes')->insertGetId([
                'codigo' => $codigo,
                'user_id' => $userId,
                'primer_nombre' => $studentData['primer_nombre'],
                'segundo_nombre' => $studentData['segundo_nombre'],
                'primer_apellido' => $studentData['primer_apellido'],
                'segundo_apellido' => $studentData['segundo_apellido'],
                'sexo' => $studentData['sexo'],
                'fecha_nacimiento' => $studentData['fecha_nacimiento'],
                'centro_educativo' => $studentData['centro_educativo'],
                'nie' => $studentData['nie'],
                'telefono_estudiante' => $studentData['telefono_estudiante'],
                'telefono_casa' => $studentData['telefono_casa'],
                'email' => $studentData['email'],
                'direccion_id' => $direccion->id,
                'nivel_educativo' => $studentData['nivel_educativo'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Asignar rol de estudiante al usuario
            if ($estudianteRole) {
                DB::table('model_has_roles')->insert([
                    'role_id' => $estudianteRole->id,
                    'model_type' => 'App\Models\User',
                    'model_id' => $userId,
                ]);
                echo "✅ Rol 'estudiante' asignado al usuario ID: {$userId}\n";
            } else {
                echo "⚠️ No se encontró el rol 'estudiante'\n";
            }

            // Crear responsable para el estudiante
            DB::table('responsables')->insert([
                'dui' => '000000000', // DUI genérico para pruebas
                'codigo_estudiante' => $codigo,
                'nombres_responsable' => 'Responsable de',
                'apellidos_responsable' => $studentData['primer_nombre'],
                'telefono_responsable' => '7000' . str_pad($index + 1000, 4, '0', STR_PAD_LEFT),
                'email_responsable' => 'responsable' . ($index + 1) . '@test.com',
                'tipo_parentesco' => 'Padre',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            echo "✅ Estudiante creado: {$studentData['name']} (NIE: {$studentData['nie']}, User ID: {$userId})\n";
        }

        echo "\n🎉 Se han creado 3 estudiantes de prueba con los siguientes NIEs:\n";
        echo "- 12345678 (Juan Carlos Pérez López)\n";
        echo "- 87654321 (María Elena Rodríguez García)\n";
        echo "- 11223344 (Luis Alberto Martínez Flores)\n";
        echo "\nTodos tienen la contraseña: password123\n";
    }
}

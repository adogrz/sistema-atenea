<?php

namespace Database\Seeders;

use App\Models\Direccion;
use App\Models\Estudiante;
use App\Models\Responsable;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TestStudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar que el rol existe
        $estudianteRole = Role::where('name', 'estudiante')->first();
        if (!$estudianteRole) {
            $this->command->error("❌ Error: No existe el rol 'estudiante'. Ejecuta primero: php artisan db:seed --class=RoleSeeder");
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
                'fecha_nacimiento' => '2012-03-15',
                'centro_educativo' => '10001', // CENTRO ESCOLAR  "ISIDRO MENÉNDEZ"
                'direccion_data' => [
                    'colonia' => 'Col. Escalón',
                    'calle' => 'Pasaje 3',
                    'numero_casa' => '25',
                    'distrito_id' => 1,
                ],
                'nivel_educativo' => 7, // Primero de Bachillerato (código numérico)
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
                'fecha_nacimiento' => '2009-07-22',
                'centro_educativo' => '10002', // CENTRO ESCOLAR "ALFREDO ESPINO"
                'direccion_data' => [
                    'colonia' => 'Col. Miramonte',
                    'calle' => 'Av. Principal',
                    'numero_casa' => '123',
                    'distrito_id' => 2,
                ],
                'nivel_educativo' => 8, // Segundo de Bachillerato
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
                'fecha_nacimiento' => '2015-11-08',
                'centro_educativo' => '10003', // CENTRO ESCOLAR "ALEJANDRO DE HUMBOLDT"
                'direccion_data' => [
                    'colonia' => 'Col. San Benito',
                    'calle' => 'Calle Los Naranjos',
                    'numero_casa' => '456',
                    'distrito_id' => 3,
                ],
                'nivel_educativo' => 6, // Noveno Grado
            ],
        ];

        foreach ($students as $index => $studentData) {
            if (User::where('email', $studentData['email'])->exists()) {
                $this->command->warn("⚠️ Usuario ya existe: {$studentData['email']}, omitiendo...");
                continue;
            }

            if (Estudiante::where('nie', $studentData['nie'])->exists()) {
                $this->command->warn("⚠️ NIE ya existe: {$studentData['nie']}, omitiendo...");
                continue;
            }

            $distritoExists = DB::table('distritos')->where('id', $studentData['direccion_data']['distrito_id'])->exists();
            if (!$distritoExists) {
                $this->command->error("❌ Error: No existe el distrito con ID {$studentData['direccion_data']['distrito_id']}");
                continue;
            }

            // Usar una transacción para asegurar la integridad de los datos
            DB::transaction(function () use ($studentData, $index, $estudianteRole) {
                // 1. Crear Usuario
                $user = User::create([
                    'name' => $studentData['name'],
                    'email' => $studentData['email'],
                    'password' => Hash::make('password123'),
                    'sede_name' => 'central',
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);

                // 2. Asignar Rol
                $user->syncRolesWithExpiration([
                    [
                        'name' => $estudianteRole->name,
                        'is_primary' => true,
                        'expires_at' => null
                    ]
                ]);
                $this->command->info("✅ Rol '{$estudianteRole->name}' asignado al usuario: {$user->email}");

                // 3. Crear Dirección
                $direccion = Direccion::create($studentData['direccion_data']);

                // 4. Crear Estudiante
                $codigo = 'EST' . str_pad($index + 1, 6, '0', STR_PAD_LEFT);
                $estudiante = Estudiante::create([
                    'codigo' => $codigo,
                    'user_id' => $user->id,
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
                    'aprobado' => false,
                ]);

                // 5. Crear Responsables (Padre y Madre ficticios)
                // Padre
                Responsable::create([
                    'dui' => '0000000' . ($index + 1) . '1',
                    'codigo_estudiante' => $estudiante->codigo,
                    'nombres_responsable' => 'Juan',
                    'apellidos_responsable' => 'Pérez',
                    'telefono_responsable' => '7000' . str_pad($index + 1000, 4, '0', STR_PAD_LEFT),
                    'email_responsable' => 'padre' . ($index + 1) . '@test.com',
                    'tipo_parentesco' => 'Padre',
                ]);
                // Madre
                Responsable::create([
                    'dui' => '0000000' . ($index + 1) . '2',
                    'codigo_estudiante' => $estudiante->codigo,
                    'nombres_responsable' => 'María',
                    'apellidos_responsable' => 'García',
                    'telefono_responsable' => '7100' . str_pad($index + 1000, 4, '0', STR_PAD_LEFT),
                    'email_responsable' => 'madre' . ($index + 1) . '@test.com',
                    'tipo_parentesco' => 'Madre',
                ]);

                $this->command->info("👨‍👩‍👧 Responsables creados para: {$studentData['name']}");

                $this->command->info("✅ Estudiante creado: {$studentData['name']} (NIE: {$studentData['nie']}, User ID: {$user->id})");
            });
        }

        $this->command->info("\n🎉 Se han procesado los estudiantes de prueba.");
        $this->command->info("Todos los usuarios creados tienen la contraseña: password123");
    }
}

<?php

namespace Database\Seeders;

use App\Models\Estudiante;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Generar datos de prueba
        $this->call([
            // No modificar orden de carga
            PermissionSeeder::class,
            SedeSeeder::class,
            AreaSeeder::class,
            DepartamentoSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
            NivelEducativoSeeder::class,
            CentroEducativoSeeder::class,
            OlimpiadaSeeder::class,
            FaseOlimpiadaSeeder::class,
            EssentialUserSeeder::class,
        ]);

        // Crear estudiantes de prueba
        Estudiante::factory(20)->create();
    }
}

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
            // USUARIOS
            EssentialUserSeeder::class,
            // CATALOGOS
            DepartamentoSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
            NivelEducativoSeeder::class,
            CentroEducativoSeeder::class,

            
            // TEST DATA
            OlimpiadaSeeder::class,
            FaseOlimpiadaSeeder::class,
            EstadoInscripcionSeeder::class,
            DefinicionEvaluacionSeeder::class,
            InscripcionOlimpiadaSeeder::class,
            ItemDefinidoSeeder::class,
            EvaluacionFaseSeeder::class,
            ItemEvaluadoSeeder::class,
        ]);

        // Crear estudiantes de prueba
        Estudiante::factory(20)->create();
    }
}

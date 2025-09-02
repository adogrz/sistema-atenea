<?php

namespace Database\Seeders;

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
            // Ususarios esenciales
            EssentialUserSeeder::class,
            // Catalogos
            DepartamentoSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
            NivelEducativoSeeder::class,
            CentroEducativoSeeder::class,

            OlimpiadaSeeder::class,
            FaseOlimpiadaSeeder::class,
            EstadoInscripcionSeeder::class,
            DefinicionEvaluacionSeeder::class,
            InscripcionOlimpiadaSeeder::class,
            ItemDefinidoSeeder::class,
            EvaluacionFaseSeeder::class,
            ItemEvaluadoSeeder::class,

            // Estudiantes de prueba
            TestStudentsSeeder::class,
        ]);
    }
}

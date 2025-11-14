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
            // --- ESTRUCTURA BASE ---
            PermissionSeeder::class,
            SedeSeeder::class,
            AreaSeeder::class,
            EssentialUserSeeder::class, // Includes admins and calificadores

            // --- CATÁLOGOS ---
            DepartamentoSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
            NivelEducativoSeeder::class,
            CentroEducativoSeeder::class,
            EstadoInscripcionSeeder::class,
            GrupoSeeder::class,

            // --- DATOS DE OLIMPIADA BASE ---
            OlimpiadaSeeder::class,
            DefinicionEvaluacionSeeder::class, // Defines the rubric
            ItemDefinidoSeeder::class, // Defines the items for the rubric
            FaseOlimpiadaSeeder::class, // Creates phases and links them to the rubric

            // --- DATOS DE PRUEBA INTERCONECTADOS ---
            TestDataSeeder::class, // Creates students, enrollments, evaluations, and assignments
        ]);
    }
}

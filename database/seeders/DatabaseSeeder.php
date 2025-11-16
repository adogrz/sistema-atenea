<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use PHPUnit\Metadata\Test;

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
            // Ususarios esenciales
            EssentialUserSeeder::class,
            // Catalogos
            DepartamentoSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
            NivelEducativoSeeder::class,
            CentroEducativoSeeder::class,

            OlimpiadaSeeder::class,
            // Definiciones de evaluación deben crearse antes de las fases
            DefinicionEvaluacionSeeder::class,
            
            FaseOlimpiadaSeeder::class,
            EstadoInscripcionSeeder::class,
            
            // Estudiantes de prueba
            TestStudentsSeeder::class,
            InscripcionOlimpiadaSeeder::class,
            ItemDefinidoSeeder::class,
            GrupoSeeder::class,


            //Materias
            MateriaSeeder::class,
        ]);
    }
}

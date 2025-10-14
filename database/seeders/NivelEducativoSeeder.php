<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NivelEducativoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('niveles_educativos')->insert([
            ['id_sede' => 'central', 'nivel' => 'Nivel 0', 'descripcion' => 'Tercer Grado', 'codigo' => 0],
            ['id_sede' => 'central', 'nivel' => 'Nivel 1', 'descripcion' => 'Cuarto Grado', 'codigo' => 1],
            ['id_sede' => 'central', 'nivel' => 'Nivel 2', 'descripcion' => 'Quinto Grado', 'codigo' => 2],
            ['id_sede' => 'central', 'nivel' => 'Nivel 3', 'descripcion' => 'Sexto Grado', 'codigo' => 3],
            ['id_sede' => 'occidental', 'nivel' => 'Nivel 4', 'descripcion' => 'Séptimo Grado', 'codigo' => 4],
            ['id_sede' => 'occidental', 'nivel' => 'Nivel 5', 'descripcion' => 'Octavo Grado', 'codigo' => 5],
            ['id_sede' => 'oriental', 'nivel' => 'Nivel 6', 'descripcion' => 'Noveno Grado', 'codigo' => 6],
            ['id_sede' => 'oriental', 'nivel' => 'Nivel 7', 'descripcion' => 'Primero de Bachillerato', 'codigo' => 7],
            ['id_sede' => 'oriental', 'nivel' => 'Nivel 8', 'descripcion' => 'Segundo de Bachillerato', 'codigo' => 8],
        ]);
    }
}
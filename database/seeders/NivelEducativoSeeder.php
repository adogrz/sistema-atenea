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
            ['id_sede' => 'central', 'nivel' => 'Nivel 0', 'descripcion' => 'Cuarto Grado', 'codigo' => 'n0'],
            ['id_sede' => 'central', 'nivel' => 'Nivel 1', 'descripcion' => 'Quinto Grado', 'codigo' => 'n1'],
            ['id_sede' => 'central', 'nivel' => 'Nivel 2', 'descripcion' => 'Sexto Grado', 'codigo' => 'n2'],
            ['id_sede' => 'occidental', 'nivel' => 'Nivel 3', 'descripcion' => 'Séptimo Grado', 'codigo' => 'n3'],
            ['id_sede' => 'occidental', 'nivel' => 'Nivel 4', 'descripcion' => 'Octavo Grado', 'codigo' => 'n4'],
            ['id_sede' => 'oriental', 'nivel' => 'Nivel 5', 'descripcion' => 'Noveno Grado', 'codigo' => 'n5'],
            ['id_sede' => 'oriental', 'nivel' => 'Nivel 6', 'descripcion' => 'Primero de Bachillerato', 'codigo' => 'n6'],
            ['id_sede' => 'oriental', 'nivel' => 'Nivel 7', 'descripcion' => 'Segundo de Bachillerato', 'codigo' => 'n7'],
        ]);
    }
}
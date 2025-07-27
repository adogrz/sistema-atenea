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
        DB::table('nivel_educativo')->insert([
            ['id_sede' => 'central', 'nivel' => 'Primer nivel', 'descripcion' => 'Cuarto Grado', 'codigo' => 'n1'],
            ['id_sede' => 'central', 'nivel' => 'Segundo nivel', 'descripcion' => 'Quinto Grado', 'codigo' => 'n2'],
            ['id_sede' => 'central', 'nivel' => 'Tercer nivel', 'descripcion' => 'Sexto Grado', 'codigo' => 'n3'],
            ['id_sede' => 'occidental', 'nivel' => 'Cuarto nivel', 'descripcion' => 'Séptimo Grado', 'codigo' => 'n4'],
            ['id_sede' => 'occidental', 'nivel' => 'Quinto nivel', 'descripcion' => 'Octavo Grado', 'codigo' => 'n5'],
            ['id_sede' => 'oriental', 'nivel' => 'Sexto nivel', 'descripcion' => 'Noveno Grado', 'codigo' => 'n6'],
            ['id_sede' => 'oriental', 'nivel' => 'Septimo nivel', 'descripcion' => 'Primero de Bachillerato', 'codigo' => 'n7'],
            ['id_sede' => 'oriental', 'nivel' => 'Octavo nivel', 'descripcion' => 'Segundo de Bachillerato', 'codigo' => 'n8'],
        ]);
    }
}

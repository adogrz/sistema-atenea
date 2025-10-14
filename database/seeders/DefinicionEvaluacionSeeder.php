<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DefinicionEvaluacionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('definiciones_evaluacion')->insert([
            'id' => 1,
            'nombre' => 'Rúbrica Matemáticas Básico',
            'descripcion' => 'Criterios para evaluar resolución, presentación y lógica.',
            'version' => 1,
            'estado' => 'publicada',
            'bloqueada' => true,
            'creada_por' => 1, // usuario administrador
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

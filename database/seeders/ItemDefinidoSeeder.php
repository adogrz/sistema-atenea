<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ItemDefinidoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('items_definidos')->insert([
            [
                'id' => 1,
                'definicion_evaluacion_id' => 1,
                'nombre' => 'Resolución de problemas',
                'descripcion' => 'Capacidad para resolver ejercicios matemáticos correctamente.',
                'orden' => 1,
                'puntaje_maximo' => 40,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'definicion_evaluacion_id' => 1,
                'nombre' => 'Presentación de resultados',
                'descripcion' => 'Claridad, orden y legibilidad de los procedimientos.',
                'orden' => 2,
                'puntaje_maximo' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'definicion_evaluacion_id' => 1,
                'nombre' => 'Justificación lógica',
                'descripcion' => 'Argumentos utilizados para sustentar las respuestas.',
                'orden' => 3,
                'puntaje_maximo' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

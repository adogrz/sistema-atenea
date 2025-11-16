<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ItemDefinidoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('items_definidos')->insert([
            // Items for Rúbrica Matemáticas Básico (ID: 1)
            [
                'id' => 1,
                'definicion_evaluacion_id' => 1,
                'nombre' => 'Resolución de problemas',
                'descripcion' => 'Capacidad para resolver ejercicios matemáticos correctamente.',
                'orden' => 1,
                'puntos_maximos' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'definicion_evaluacion_id' => 1,
                'nombre' => 'Presentación de resultados',
                'descripcion' => 'Claridad, orden y legibilidad de los procedimientos.',
                'orden' => 2,
                'puntos_maximos' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'definicion_evaluacion_id' => 1,
                'nombre' => 'Justificación lógica',
                'descripcion' => 'Argumentos utilizados para sustentar las respuestas.',
                'orden' => 3,
                'puntos_maximos' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Items for Rúbrica de Programación (ID: 2)
            [
                'id' => 4,
                'definicion_evaluacion_id' => 2,
                'nombre' => 'Funcionalidad',
                'descripcion' => 'El programa cumple con todos los requisitos funcionales.',
                'orden' => 1,
                'puntos_maximos' => 40,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'definicion_evaluacion_id' => 2,
                'nombre' => 'Calidad del Código',
                'descripcion' => 'El código es limpio, legible y sigue las buenas prácticas.',
                'orden' => 2,
                'puntos_maximos' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'definicion_evaluacion_id' => 2,
                'nombre' => 'Manejo de Errores',
                'descripcion' => 'El programa maneja los errores de forma robusta.',
                'orden' => 3,
                'puntos_maximos' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'definicion_evaluacion_id' => 2,
                'nombre' => 'Rendimiento',
                'descripcion' => 'El programa es eficiente en el uso de recursos.',
                'orden' => 4,
                'puntos_maximos' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Items for Rúbrica de Escritura (ID: 3)
            [
                'id' => 8,
                'definicion_evaluacion_id' => 3,
                'nombre' => 'Tesis y Argumentos',
                'descripcion' => 'La tesis es clara y los argumentos la respaldan sólidamente.',
                'orden' => 1,
                'puntos_maximos' => 35,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'definicion_evaluacion_id' => 3,
                'nombre' => 'Estructura y Organización',
                'descripcion' => 'El ensayo está bien estructurado con una introducción, desarrollo y conclusión lógicos.',
                'orden' => 2,
                'puntos_maximos' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 10,
                'definicion_evaluacion_id' => 3,
                'nombre' => 'Uso del Lenguaje',
                'descripcion' => 'Gramática, puntuación y estilo son correctos y efectivos.',
                'orden' => 3,
                'puntos_maximos' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 11,
                'definicion_evaluacion_id' => 3,
                'nombre' => 'Originalidad y Creatividad',
                'descripcion' => 'El ensayo muestra un pensamiento original y creativo.',
                'orden' => 4,
                'puntos_maximos' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

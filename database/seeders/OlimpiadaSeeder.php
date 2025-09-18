<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OlimpiadaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('olimpiadas')->insert([
            [
                'nombre' => 'Olimpiada Matemática 2025',
                'descripcion' => 'Resolución de problemas lógicos y algebraicos a nivel nacional',
                'area_id' => 1,
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Química 2025',
                'descripcion' => 'Evaluación teórica y experimental de principios químicos',
                'area_id' => 5,
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Biología 2025',
                'descripcion' => 'Competencia académica sobre genética, ecología y anatomía',
                'area_id' => 2,
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Informática 2025',
                'descripcion' => 'Algoritmos, estructuras de datos y resolución computacional',
                'area_id' => 6,
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Astronomía 2025',
                'descripcion' => 'Conocimiento del cosmos, observación astronómica y física celeste',
                'area_id' => 4,
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}

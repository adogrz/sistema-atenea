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
                'fecha_inicio' => '2025-06-01',
                'fecha_fin' => '2025-07-15',
                'area_academica' => 'Matemáticas',
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Química 2025',
                'descripcion' => 'Evaluación teórica y experimental de principios químicos',
                'fecha_inicio' => '2025-06-10',
                'fecha_fin' => '2025-07-20',
                'area_academica' => 'Química',
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Biología 2025',
                'descripcion' => 'Competencia académica sobre genética, ecología y anatomía',
                'fecha_inicio' => '2025-06-15',
                'fecha_fin' => '2025-07-25',
                'area_academica' => 'Biología',
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Informática 2025',
                'descripcion' => 'Algoritmos, estructuras de datos y resolución computacional',
                'fecha_inicio' => '2025-07-01',
                'fecha_fin' => '2025-08-10',
                'area_academica' => 'Informática',
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Astronomía 2025',
                'descripcion' => 'Conocimiento del cosmos, observación astronómica y física celeste',
                'fecha_inicio' => '2025-07-15',
                'fecha_fin' => '2025-08-20',
                'area_academica' => 'Astronomía',
                'activa' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}

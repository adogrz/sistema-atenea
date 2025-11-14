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
                'area_id' => 1, // Matemática
                'activa' => true,
                'tipo' => 'nivel',
                'nivel_educativo_id' => 7, // Primero de Bachillerato
                'anio' => 2025,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Química 2025',
                'descripcion' => 'Evaluación teórica y experimental de principios químicos',
                'area_id' => 5, // Química
                'activa' => true,
                'tipo' => 'nivel',
                'nivel_educativo_id' => 6, // Noveno Grado
                'anio' => 2025,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Biología 2025',
                'descripcion' => 'Competencia académica sobre genética, ecología y anatomía',
                'area_id' => 2, // Biología
                'activa' => true,
                'tipo' => 'nivel',
                'nivel_educativo_id' => 8, // Segundo de Bachillerato
                'anio' => 2025,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Informática 2025',
                'descripcion' => 'Algoritmos, estructuras de datos y resolución computacional',
                'area_id' => 6, // Informática
                'activa' => true,
                'tipo' => 'olimpico',
                'nivel_educativo_id' => 7, // Primero de Bachillerato
                'anio' => 2025,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Olimpiada de Astronomía 2025',
                'descripcion' => 'Conocimiento del cosmos, observación astronómica y física celeste',
                'area_id' => 4, // Astronomía
                'activa' => false,
                'tipo' => 'olimpico',
                'nivel_educativo_id' => 7, // Primero de Bachillerato
                'anio' => 2025,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // --- Entries for 2024 ---
            [
                'nombre' => 'Olimpiada Matemática 2024',
                'descripcion' => 'Resolución de problemas lógicos y algebraicos a nivel nacional - Edición 2024',
                'area_id' => 1, // Matemática
                'activa' => false,
                'tipo' => 'nivel',
                'nivel_educativo_id' => 7, // Primero de Bachillerato
                'anio' => 2024,
                'created_at' => now()->subYear(),
                'updated_at' => now()->subYear(),
            ],
            [
                'nombre' => 'Olimpiada de Química 2024',
                'descripcion' => 'Evaluación teórica y experimental de principios químicos - Edición 2024',
                'area_id' => 5, // Química
                'activa' => false,
                'tipo' => 'nivel',
                'nivel_educativo_id' => 6, // Noveno Grado
                'anio' => 2024,
                'created_at' => now()->subYear(),
                'updated_at' => now()->subYear(),
            ]
        ]);
    }
}
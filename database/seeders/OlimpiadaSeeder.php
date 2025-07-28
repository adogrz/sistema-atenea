<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Olimpiada;

class OlimpiadaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        Olimpiada::create([
            'nombre' => 'Olimpiada Nacional de Matemáticas',
            'fecha_inicio' => '2025-08-10',
            'fecha_fin' => '2025-08-15',
            'grado_min' => 3,
            'grado_max' => 9,
        ]);
         Olimpiada::create([
            'nombre' => 'Olimpiada Nacional de Biología',
            'fecha_inicio' => '2025-08-10',
            'fecha_fin' => '2025-08-15',
            'grado_min' => 6,
            'grado_max' => 10,
        ]);



    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InternadoMateria;

class MateriaSeeder extends Seeder
{
    public function run(): void
    {
        $materias = [
            ['codigo' => 'MAT',   'nombre' => 'Matemática'],
            ['codigo' => 'QUI',   'nombre' => 'Química'],
            ['codigo' => 'BIO',   'nombre' => 'Biología'],
            ['codigo' => 'INF',   'nombre' => 'Informática'],
            ['codigo' => 'ASTRO', 'nombre' => 'Astronomía'],
        ];

        foreach ($materias as $m) {
            InternadoMateria::firstOrCreate(
                ['codigo' => $m['codigo']],
                ['nombre' => $m['nombre']]
            );
        }
    }
}
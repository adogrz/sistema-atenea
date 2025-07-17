<?php

namespace Database\Seeders;

use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $areas = [
            'matematicas' => 'Matemáticas',
            'fisica' => 'Física',
            'quimica' => 'Química',
            'biologia' => 'Biología',
            'informatica' => 'Informática',
        ];

        foreach ($areas as $key => $description) {
            Area::firstOrCreate(
                ['name' => $key],
                ['description' => $description]
            );
        }
    }
}

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
            'matematica' => 'Matemática',
            'biologia' => 'Biología',
            'fisica' => 'Física',
            'astronomia' => 'Astronomía',
            'quimica' => 'Química',
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

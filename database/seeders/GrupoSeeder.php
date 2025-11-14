<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Area;

class GrupoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $areas = Area::all();

        if ($areas->isEmpty()) {
            $this->command->warn('No se encontraron áreas. El seeder de grupos fue omitido.');
            return;
        }

        $horarios = ['mañana', 'tarde'];
        $gruposData = [];
        $areaIndex = 0;

        for ($i = 0; $i < 8; $i++) { // Grupos A, B, C... H
            $letra = chr(65 + $i); // ASCII para A, B, C...
            $area = $areas[$areaIndex];

            $gruposData[] = [
                'nombre' => "Grupo {$letra}",
                'descripcion' => "Descripción para el Grupo {$letra} del área {$area->name}.",
                'horario' => $horarios[$i % 2], // Alternar mañana y tarde
                'area_id' => $area->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $areaIndex = ($areaIndex + 1) % $areas->count(); // Rotar entre las áreas disponibles
        }

        DB::table('grupos')->insert($gruposData);

        $this->command->info('Grupos insertados correctamente.');
    }
}

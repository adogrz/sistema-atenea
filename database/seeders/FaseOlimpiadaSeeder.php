<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class FaseOlimpiadaSeeder extends Seeder
{
    public function run(): void
    {
        // Asegúrate de tener al menos una olimpiada creada
        $olimpiadaId = DB::table('olimpiadas')->value('id');

        if (!$olimpiadaId) {
            $this->command->warn('No se encontró ninguna olimpiada. El seeder de fases fue omitido.');
            return;
        }

        $fases = [
            [
                'olimpiada_id' => $olimpiadaId,
                'nombre' => 'Fase Municipal',
                'orden' => 1,
                'estado' => 'programada',
                'fecha_inicio' => Carbon::now(),
                'fecha_fin' => Carbon::now()->addDays(14),
                'activa' => true,
                'definicion_evaluacion_id' => 1, // Link to the seeded evaluation definition
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'olimpiada_id' => $olimpiadaId,
                'nombre' => 'Fase Departamental',
                'orden' => 2,
                'estado' => 'programada',
                'fecha_inicio' => Carbon::now(),
                'fecha_fin' => Carbon::now()->addDays(28),
                'activa' => true,
                'definicion_evaluacion_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'olimpiada_id' => $olimpiadaId,
                'nombre' => 'Fase Nacional',
                'orden' => 3,
                'estado' => 'programada',
                'fecha_inicio' => Carbon::now(),
                'fecha_fin' => Carbon::now()->addDays(42),
                'activa' => true,
                'definicion_evaluacion_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('fases_olimpiadas')->insert($fases);

        $this->command->info('Fases de olimpiada insertadas correctamente.');
    }
}

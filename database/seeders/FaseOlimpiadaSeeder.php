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

        $startDate = Carbon::now()->addMonth(); // Start next month to have clean dates

        $fases = [
            [
                'olimpiada_id' => $olimpiadaId,
                'nombre' => 'Fase Municipal',
                'orden' => 1,
                'cupos' => 50,
                'resultados_publicados' => false,
                'fecha_inicio' => $startDate,
                'fecha_fin' => $startDate->copy()->addDays(14),
                'activa' => true,
                'definicion_evaluacion_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'olimpiada_id' => $olimpiadaId,
                'nombre' => 'Fase Departamental',
                'orden' => 2,
                'cupos' => 30,
                'resultados_publicados' => false,
                'fecha_inicio' => $startDate->copy()->addDays(15),
                'fecha_fin' => $startDate->copy()->addDays(29),
                'activa' => true,
                'definicion_evaluacion_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'olimpiada_id' => $olimpiadaId,
                'nombre' => 'Fase Nacional',
                'orden' => 3,
                'cupos' => 10,
                'resultados_publicados' => false,
                'fecha_inicio' => $startDate->copy()->addDays(30),
                'fecha_fin' => $startDate->copy()->addDays(44),
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

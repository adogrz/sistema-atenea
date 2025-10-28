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
                'cupos' => 50, // Example value
                'nota_minima_aprobacion' => 60.00, // Example value
                'fecha_inicio_inscripcion' => Carbon::now()->subDays(7),
                'fecha_fin_inscripcion' => Carbon::now()->addDays(7),
                'resultados_publicados' => false,
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
                'cupos' => 30, // Example value
                'nota_minima_aprobacion' => 70.00, // Example value
                'fecha_inicio_inscripcion' => Carbon::now()->subDays(7),
                'fecha_fin_inscripcion' => Carbon::now()->addDays(7),
                'resultados_publicados' => false,
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
                'cupos' => 10, // Example value
                'nota_minima_aprobacion' => 80.00, // Example value
                'fecha_inicio_inscripcion' => Carbon::now()->subDays(7),
                'fecha_fin_inscripcion' => Carbon::now()->addDays(7),
                'resultados_publicados' => false,
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

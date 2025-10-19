<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meses = [
            ['nombre' => 'Enero', 'fechaInicio' => '2025-01-01', 'fechaFin' => '2025-01-31', 'fechaCierre' => '2025-02-05'],
            ['nombre' => 'Febrero', 'fechaInicio' => '2025-02-01', 'fechaFin' => '2025-02-28', 'fechaCierre' => '2025-03-05'],
            ['nombre' => 'Marzo', 'fechaInicio' => '2025-03-01', 'fechaFin' => '2025-03-31', 'fechaCierre' => '2025-04-05'],
            ['nombre' => 'Abril', 'fechaInicio' => '2025-04-01', 'fechaFin' => '2025-04-30', 'fechaCierre' => '2025-05-05'],
        ];

        foreach ([0,1,2,3] as $idNivel) {
            foreach ($meses as $mes) {
                DB::table('mes')->insert([
                    'nombre'            => $mes['nombre'],
                    'fechaInicio'       => $mes['fechaInicio'],
                    'fechaFin'          => $mes['fechaFin'],
                    'fechaCierre'       => $mes['fechaCierre'],
                    'idNivelEducativo'  => $idNivel,
                    'created_at'        => Carbon::now(),
                    'updated_at'        => Carbon::now(),
                ]);
            }
        }
    }
}

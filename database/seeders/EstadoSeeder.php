<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadosOlimpiadasSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('estados')->insert([
            [
                'codigo' => 'inscrito',
                'nombre' => 'INS',
                'descripcion' => 'Participación activa confirmada',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo' => 'retirado',
                'nombre' => 'RET',
                'descripcion' => 'Retiro voluntario o forzado antes de la competencia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo' => 'aprobado',
                'nombre' => 'APO',
                'descripcion' => 'Participante aprobado en fase evaluada',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo' => 'no_aprobado',
                'nombre' => 'NAP',
                'descripcion' => 'Participante no alcanzó nota mínima',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

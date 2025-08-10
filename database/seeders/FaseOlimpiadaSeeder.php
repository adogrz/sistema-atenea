<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fase;
use App\Models\FaseOlimpiada;
use App\Models\Olimpiada;
use Carbon\Carbon;

class FaseOlimpiadaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $olimpiadas = Olimpiada::all();

        foreach ($olimpiadas as $index => $olimpiada) {
            FaseOlimpiada::create([
                'nombre'         => 'Fase Regional ' . ($index + 1),
                'descripcion'    => 'Primera fase regional de la olimpiada ' . $olimpiada->nombre,
                'olimpiada_id'   => $olimpiada->id,
                'fecha_inicio'   => Carbon::now()->addDays($index * 5),
                'fecha_fin'      => Carbon::now()->addDays(($index * 5) + 10),
                'activa'         => true,
                'created_at'     => now(),
                'updated_at'     => now(),
                'numero_fase'    => ($index + 1),
            ]);
        }

        // Puedes agregar una fase nacional o internacional si lo deseas
        FaseOlimpiada::create([
            'nombre'         => 'Fase Nacional',
            'descripcion'    => 'Fase final a nivel nacional para todos los clasificados',
            'olimpiada_id'   => $olimpiadas->first()->id,
            'fecha_inicio'   => Carbon::now()->addMonths(2),
            'fecha_fin'      => Carbon::now()->addMonths(2)->addDays(7),
            'activa'         => false,
            'created_at'     => now(),
            'updated_at'     => now(),
            'numero_fase'    => 2,
        ]);
    }
}

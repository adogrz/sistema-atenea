<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ItemEvaluado;
use App\Models\EvaluacionFase;

class ItemEvaluadoSeeder extends Seeder
{
    public function run(): void
    {
        // Asegúrate de que la evaluación y los ítems definidos existen
        $evaluacion = EvaluacionFase::find(1);

        if (!$evaluacion) {
            $this->command->warn('No se encontró evaluación con ID 1. Seeder cancelado.');
            return;
        }

        $notas = [
            ['item_definido_id' => 1, 'puntaje' => 36.62],
            ['item_definido_id' => 2, 'puntaje' => 21.50],
            ['item_definido_id' => 3, 'puntaje' => 28.06],
        ];

        foreach ($notas as $nota) {
            ItemEvaluado::create([
                'evaluacion_fase_id' => $evaluacion->id,
                'item_definido_id'   => $nota['item_definido_id'],
                'puntuacion'            => $nota['puntaje'],
                'observaciones'        => null,
                'calificado_por'     => 2, // Usuario calificador (asegúrate que exista)
                'calificado_en'      => now(),
            ]);
        }
    }
}

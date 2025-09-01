<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EvaluacionFase;
use App\Models\InscripcionOlimpiada;
use App\Models\User;

class EvaluacionFaseSeeder extends Seeder
{
    public function run(): void
    {
        $calificador = User::all()->first();
        $inscripcion = InscripcionOlimpiada::first();

        if (!$calificador || !$inscripcion) {
            $this->command->warn('No hay calificador o inscripción disponibles.');
            return;
        }

        EvaluacionFase::updateOrCreate(
            [
                'inscripcion_id'    => $inscripcion->id,
                'calificador_id'    => $calificador->id,
            ],
            [
                'fase_olimpiada_id' => $inscripcion->fase_id,
                'estado'            => 'en_proceso',
                'total'             => 0,
            ]
        );
    }
}

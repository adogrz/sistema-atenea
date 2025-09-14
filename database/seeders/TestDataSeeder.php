<?php

namespace Database\Seeders;

use App\Models\CalificadorItemAsignado;
use App\Models\Estudiante;
use App\Models\Evaluacion;
use App\Models\FaseOlimpiada;
use App\Models\InscripcionOlimpiada;
use App\Models\ItemDefinido;
use App\Models\ItemEvaluado;
use App\Models\Olimpiada;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get the main entities
        $olimpiada = Olimpiada::where('nombre', 'Olimpiada Matemática 2025')->first();
        if (!$olimpiada) {
            $this->command->error('No se encontró la olimpiada de prueba. Ejecuta OlimpiadaSeeder primero.');
            return;
        }

        $fase = $olimpiada->fases()->where('nombre', 'Fase Municipal')->first();
        if (!$fase) {
            $this->command->error('No se encontró la fase de prueba. Ejecuta FaseOlimpiadaSeeder primero.');
            return;
        }

        $itemsDefinidos = $fase->definicionEvaluacion->itemsDefinidos ?? collect();
        if ($itemsDefinidos->isEmpty()) {
            $this->command->error('No se encontraron ítems definidos para la fase. Asegúrate de que la fase tenga una definición de evaluación con ítems.');
            return;
        }

        $calificadores = User::role('calificador')->get();
        if ($calificadores->count() < 2) {
            $this->command->error('No hay suficientes calificadores. Se necesitan al menos 2.');
            return;
        }

        // 2. Create students and enroll them
        $estudiantes = Estudiante::factory(20)->create();
        foreach ($estudiantes as $estudiante) {
            InscripcionOlimpiada::create([
                'olimpiada_id' => $olimpiada->id,
                'estudiante_codigo' => $estudiante->codigo,
                'estado_inscripcion_id' => 1, // "Pendiente" or a valid state
            ]);
        }

        // 3. Create evaluations for each student in the phase
        $inscripciones = $olimpiada->inscripciones()->get();
        foreach ($inscripciones as $inscripcion) {
            $evaluacion = Evaluacion::create([
                'inscripcion_id' => $inscripcion->id,
                'fase_olimpiada_id' => $fase->id,
                'total_puntaje' => 0,
            ]);

            // 4. Create the evaluated items for each evaluation
            foreach ($itemsDefinidos as $itemDefinido) {
                ItemEvaluado::create([
                    'evaluacion_id' => $evaluacion->id,
                    'item_definido_id' => $itemDefinido->id,
                    'puntaje' => 0, // Initial score
                ]);
            }
        }

        // 5. Assign graders to items
        $calificador1 = $calificadores[0];
        $calificador2 = $calificadores[1];

        foreach ($itemsDefinidos as $index => $item) {
            // Assign 2 graders to each item
            CalificadorItemAsignado::updateOrCreate([
                'calificador_id' => ($index % 2 == 0) ? $calificador1->id : $calificador2->id,
                'fase_olimpiada_id' => $fase->id,
                'item_definido_id' => $item->id,
            ]);
            CalificadorItemAsignado::updateOrCreate([
                'calificador_id' => ($index % 2 == 0) ? $calificador2->id : $calificador1->id,
                'fase_olimpiada_id' => $fase->id,
                'item_definido_id' => $item->id,
            ]);
        }

        $this->command->info('Seeder de datos de prueba ejecutado exitosamente!');
    }
}

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
use Illuminate\Support\Facades\DB;

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

        // 2. Create students and enroll them
        $estudiantes = Estudiante::factory(20)->create();
        $estadoInscritoId = DB::table('estados_inscripciones')->where('slug', 'inscrito')->value('id') ?? 1;

        foreach ($estudiantes as $estudiante) {
            InscripcionOlimpiada::create([
                'olimpiada_id' => $olimpiada->id,
                'estudiante_codigo' => $estudiante->codigo,
                'estado_inscripcion_id' => $estadoInscritoId,
            ]);
        }

        // 3. Create evaluations for each student in the phase with random scores
        $inscripciones = $olimpiada->inscripciones()->get();
        foreach ($inscripciones as $inscripcion) {
            $totalPuntaje = 0;
            $evaluacion = Evaluacion::create([
                'inscripcion_id' => $inscripcion->id,
                'fase_olimpiada_id' => $fase->id,
                'total_puntaje' => 0, // Will be updated after item scores
                'finalizada_at' => now(), // Use the correct column name
                'estado' => 'finalizada', // Add the new estado column
            ]);

            // 4. Create the evaluated items for each evaluation with random scores
            foreach ($itemsDefinidos as $itemDefinido) {
                $puntaje = rand(0, $itemDefinido->puntos_maximos);
                ItemEvaluado::create([
                    'evaluacion_id' => $evaluacion->id,
                    'item_definido_id' => $itemDefinido->id,
                    'puntaje' => $puntaje,
                    'calificador_id' => null, // Assign null for now, as no specific calificadores are seeded
                ]);
                $totalPuntaje += $puntaje;
            }

            // Update total_puntaje for the evaluation
            $evaluacion->update(['total_puntaje' => $totalPuntaje]);
        }

        $this->command->info('Seeder de datos de prueba ejecutado exitosamente!');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\EvaluacionFase;
use App\Models\InscripcionOlimpiada;
use App\Models\User;

class EvaluacionFaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Tomar una inscripción cualquiera
        /** @var InscripcionOlimpiada|null $inscripcion */
        $inscripcion = InscripcionOlimpiada::query()->first();

        if (!$inscripcion) {
            $this->command?->warn('EvaluacionFaseSeeder: No hay inscripciones disponibles.');
            return;
        }

        // 2) Resolver la fase INICIAL (orden = 1) para la misma olimpiada
        $fase = DB::table('fases_olimpiadas')
            ->select('id', 'orden')
            ->where('olimpiada_id', $inscripcion->olimpiada_id)
            ->orderBy('orden', 'asc')
            ->first();

        if (!$fase) {
            $this->command?->warn('EvaluacionFaseSeeder: No existe ninguna fase para la olimpiada de la inscripción.');
            return;
        }

        // 3) (Opcional) calificador de referencia
        $calificador = User::query()->first(); // puede quedar null si no hay usuarios
        $calificadorId = $calificador?->id;

        // 4) Crear/actualizar evaluación para (inscripcion, fase)
        //    Notar: la unicidad ahora es (inscripcion_id, fase_olimpiada_id)
        EvaluacionFase::query()->updateOrCreate(
            [
                'inscripcion_id'    => $inscripcion->id,
                'fase_olimpiada_id' => $fase->id,
            ],
            [
                // si manejas quién cierra o gestiona, puedes guardar el calificador
                'calificador_id' => $calificadorId, // nullable
                'finalizada'     => false,
                'aprobada'       => false,
                'total'          => 0.00,
                'cerrada_en'     => null,
                'metadata'       => null,
            ]
        );

        $this->command?->info(sprintf(
            'EvaluacionFaseSeeder: Evaluación creada/actualizada para inscripción %d en fase %d (orden %s).',
            $inscripcion->id,
            $fase->id,
            $fase->orden ?? 'N/D'
        ));
    }
}

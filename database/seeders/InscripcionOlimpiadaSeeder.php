<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InscripcionOlimpiada;
use App\Models\Estudiante;

class InscripcionOlimpiadaSeeder extends Seeder
{
    public function run(): void
    {
        // Crear un estudiante con factory
        $estudiante = Estudiante::factory()->create();

        InscripcionOlimpiada::create([
            'olimpiada_id'          => 1, // Asegúrate que exista una olimpiada con ID 1
            'estudiante_codigo'     => $estudiante->codigo,
            'estado_inscripcion_id' => 1, // Asegúrate que exista un estado válido (ej. pendiente)
        ]);
    }
}

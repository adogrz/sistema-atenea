<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InscripcionOlimpiada;
use App\Models\Estudiante;

class InscripcionOlimpiadaSeeder extends Seeder
{
    public function run(): void
    {
        // Usar un estudiante existente del TestStudentsSeeder
        $estudiante = Estudiante::where('nie', '12345678')->first();

        if (!$estudiante) {
            echo "⚠️ No se encontró estudiante de prueba. Asegúrate de ejecutar TestStudentsSeeder primero.\n";
            return;
        }

        // Verificar si ya existe una inscripción para evitar duplicados
        $existingInscripcion = InscripcionOlimpiada::where('estudiante_codigo', $estudiante->codigo)->first();
        if ($existingInscripcion) {
            echo "⚠️ Ya existe una inscripción para el estudiante {$estudiante->codigo}\n";
            return;
        }

        InscripcionOlimpiada::create([
            'olimpiada_id'          => 1, // Asegúrate que exista una olimpiada con ID 1
            'fase_id'               => 1, // Asegúrate que exista una fase con ID 1
            'estudiante_codigo'     => $estudiante->codigo,
            'estado_inscripcion_id' => 1, // Asegúrate que exista un estado válido (ej. pendiente)
            'codigo'                => 'OLI2025-0001',
            'fecha_inscripcion'     => now(),
            'activo'                => true,
            'observaciones'         => null,
        ]);

        echo "✅ Inscripción creada para estudiante: {$estudiante->primer_nombre} {$estudiante->primer_apellido} (Código: {$estudiante->codigo})\n";
    }
}

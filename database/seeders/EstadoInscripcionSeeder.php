<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EstadoInscripcion;

class EstadoInscripcionSeeder extends Seeder
{

    public function run(): void
    {
        EstadoInscripcion::truncate();

        EstadoInscripcion::insert([
            [
                'nombre' => 'Pendiente',
                'slug' => 'pendiente',
                'es_final' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Inscrito',
                'slug' => 'inscrito',
                'es_final' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Anulado',
                'slug' => 'anulado',
                'es_final' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Finalizado',
                'slug' => 'finalizado',
                'es_final' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('Estados de inscripción insertados correctamente.');
    }
}

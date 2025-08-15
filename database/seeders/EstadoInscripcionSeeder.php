<?php

namespace Database\Seeders;

use App\Models\EstadoInscripcion;
use Illuminate\Database\Seeder;

class EstadoInscripcionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['nombre' => 'pendiente',  'descripcion' => 'Inscripción creada, en revisión', 'es_final' => false, 'activo' => true],
            ['nombre' => 'aprobada',   'descripcion' => 'Inscripción aprobada',            'es_final' => false, 'activo' => true],
            ['nombre' => 'rechazada',  'descripcion' => 'Inscripción rechazada',           'es_final' => true,  'activo' => true],
            ['nombre' => 'anulada',    'descripcion' => 'Inscripción anulada',             'es_final' => true,  'activo' => true],
        ];

        foreach ($data as $row) {
            EstadoInscripcion::firstOrCreate(['nombre' => $row['nombre']], $row);
        }
    }
}
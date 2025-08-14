<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AcademicoController extends Controller
{
    public function __invoke()
    {
        $sampleEvents = [
            [
                'id' => 1,
                'name' => 'Registro de Aspirantes 2025',
                'type' => 'registro-aspirantes',
                'start_date' => '2025-01-15',
                'end_date' => '2025-01-30',
                'start_time' => '09:00',
                'end_time' => '17:00',
                'description' => 'Periodo de registro para nuevos aspirantes',
                'location' => 'Campus Principal',
                'status' => 'activo',
                'created_at' => '2025-01-01 10:00:00',
            ],
            [
                'id' => 2,
                'name' => 'Academia Sabatina',
                'type' => 'academia-sabatina',
                'start_date' => '2025-02-01',
                'end_date' => '2025-02-28',
                'start_time' => '08:00',
                'end_time' => '12:00',
                'description' => 'Clases de fin de semana',
                'location' => 'Aula 101',
                'status' => 'activo',
                'created_at' => '2025-01-02 14:30:00',
            ],
            [
                'id' => 3,
                'name' => 'Examen Final FDTC',
                'type' => 'examen',
                'start_date' => '2025-03-15',
                'end_date' => '2025-03-15',
                'start_time' => '10:00',
                'end_time' => '12:00',
                'description' => 'Examen final del programa FDTC',
                'location' => 'Auditorio Principal',
                'status' => 'inactivo',
                'created_at' => '2025-01-03 16:45:00',
            ],
            [
                'id' => 4,
                'name' => 'Graduación 2025',
                'type' => 'graduacion',
                'start_date' => '2025-04-20',
                'end_date' => '2025-04-20',
                'start_time' => '18:00',
                'end_time' => '21:00',
                'description' => 'Ceremonia de graduación',
                'location' => 'Teatro Municipal',
                'status' => 'completado',
                'created_at' => '2025-01-04 12:15:00',
            ],
        ];

        return Inertia::render('dashboard-academico', [
            'events' => $sampleEvents,
        ]);
    }
}
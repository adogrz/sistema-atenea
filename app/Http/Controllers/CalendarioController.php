<?php

namespace App\Http\Controllers;

use App\Models\FaseOlimpiada;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarioController extends Controller
{
    public function index()
    {
        $fases = FaseOlimpiada::with('olimpiada.area')->get();

        $events = $fases->map(function ($fase) {
            return [
                'id' => $fase->id,
                'title' => $fase->olimpiada->nombre . ' - ' . $fase->nombre,
                'start' => $fase->fecha_inicio->format('Y-m-d'),
                'end' => $fase->fecha_fin->addDay()->format('Y-m-d'), // FullCalendar's end date is exclusive
                'backgroundColor' => $this->getAreaColor($fase->olimpiada->area->name),
                'borderColor' => $this->getAreaColor($fase->olimpiada->area->name),
                'extendedProps' => [
                    'cupos' => $fase->cupos,
                    'nota_minima_aprobacion' => $fase->nota_minima_aprobacion,
                    'olimpiada_nombre' => $fase->olimpiada->nombre,
                    'fase_nombre' => $fase->nombre,
                ]
            ];
        });

        return Inertia::render('Calendario/Index', [
            'events' => $events,
        ]);
    }

    private function getAreaColor($areaName)
    {
        $colors = [
            'Matemática' => '#3B82F6', // blue-500
            'Biología' => '#10B981', // green-500
            'Química' => '#F59E0B', // amber-500
            'Física' => '#8B5CF6', // violet-500
            'Informática' => '#EF4444', // red-500
            'Astronomía' => '#14B8A6', // teal-500
        ];

        return $colors[$areaName] ?? '#6B7280'; // gray-500
    }
}

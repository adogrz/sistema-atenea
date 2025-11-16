<?php

namespace App\Console\Commands;

use App\Models\Assignment;
use Illuminate\Console\Command;

class ShowAssignments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assignments:show {--active : Show only active assignments}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Muestra las asignaciones clínicas registradas';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $query = Assignment::with(['student', 'professional.sede']);

        if ($this->option('active')) {
            $query->active();
        }

        $assignments = $query->get();

        if ($assignments->isEmpty()) {
            $this->warn('No se encontraron asignaciones.');
            return Command::SUCCESS;
        }

        $this->info("Total de asignaciones: " . $assignments->count());
        $this->newLine();

        $headers = ['ID', 'Estudiante', 'NIE', 'Profesional', 'Sede', 'Tipo', 'Activo', 'Creada'];
        $rows = [];

        foreach ($assignments as $assignment) {
            $rows[] = [
                $assignment->id,
                $assignment->student->primer_nombre . ' ' . $assignment->student->primer_apellido,
                $assignment->student_nie,
                $assignment->professional->name,
                $assignment->professional->sede->description ?? $assignment->professional->sede_name,
                $assignment->getTypeLabel(),
                $assignment->is_active ? '✓' : '✗',
                $assignment->created_at->format('d/m/Y H:i'),
            ];
        }

        $this->table($headers, $rows);

        return Command::SUCCESS;
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\InternadoMateria;
use App\Models\InternadoPeriodo;
use App\Models\InternadoEvaluacion;
use App\Models\NivelEducativo;

class InternadoEvaluacionesPorNivelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Este seeder crea evaluaciones de ejemplo por nivel para el internado FDTC
     */
    public function run(): void
    {
        // Obtener o crear materias de ejemplo
        $matematicas = InternadoMateria::firstOrCreate(
            ['codigo' => 'MAT'],
            ['nombre' => 'Matemáticas']
        );

        $fisica = InternadoMateria::firstOrCreate(
            ['codigo' => 'FIS'],
            ['nombre' => 'Física']
        );

        $quimica = InternadoMateria::firstOrCreate(
            ['codigo' => 'QUI'],
            ['nombre' => 'Química']
        );

        $biologia = InternadoMateria::firstOrCreate(
            ['codigo' => 'BIO'],
            ['nombre' => 'Biología']
        );

        // Obtener o crear un periodo de ejemplo
        $periodo = InternadoPeriodo::firstOrCreate(
            ['nombre' => 'Periodo 2025-I'],
            [
                'fecha_inicio' => '2025-01-15',
                'fecha_fin' => '2025-06-30',
                'descripcion' => 'Primer periodo académico 2025',
                'estado' => 'activo'
            ]
        );

        // Niveles educativos (basado en tu seeder existente)
        $niveles = [
            'n0' => 'Cuarto Grado',
            'n1' => 'Quinto Grado',
            'n2' => 'Sexto Grado',
            'n3' => 'Séptimo Grado',
            'n4' => 'Octavo Grado',
            'n5' => 'Noveno Grado',
            'n6' => 'Primero de Bachillerato',
            'n7' => 'Segundo de Bachillerato',
        ];

        // ===== MATEMÁTICAS =====
        // Evaluación 1: Álgebra Básica (para niveles n0, n1, n2)
        $eval_algebra_basica = InternadoEvaluacion::create([
            'periodo_id' => $periodo->id,
            'materia_id' => $matematicas->id,
            'nombre' => 'Evaluación: Álgebra Básica',
            'descripcion' => 'Evaluación de conceptos básicos de álgebra',
            'peso_porcentual' => 25.00,
            'nota_maxima' => 10.0,
            'fecha_inicio' => '2025-02-01',
            'fecha_fin' => '2025-02-15',
            'permite_credito_extra' => true,
            'credito_extra_max' => 1.0,
            'niveles_aplicables' => [
                ['codigo' => 'n0', 'obligatoria' => true, 'notas' => 'Enfoque en operaciones básicas'],
                ['codigo' => 'n1', 'obligatoria' => true, 'notas' => 'Incluye ecuaciones simples'],
                ['codigo' => 'n2', 'obligatoria' => true, 'notas' => 'Incluye sistemas de ecuaciones'],
            ],
        ]);

        // Evaluación 2: Geometría Avanzada (para niveles n3, n4, n5)
        $eval_geometria = InternadoEvaluacion::create([
            'periodo_id' => $periodo->id,
            'materia_id' => $matematicas->id,
            'nombre' => 'Evaluación: Geometría Avanzada',
            'descripcion' => 'Evaluación de geometría plana y espacial',
            'peso_porcentual' => 30.00,
            'nota_maxima' => 10.0,
            'fecha_inicio' => '2025-03-01',
            'fecha_fin' => '2025-03-15',
            'permite_credito_extra' => true,
            'credito_extra_max' => 1.5,
            'niveles_aplicables' => [
                ['codigo' => 'n3', 'obligatoria' => true, 'notas' => 'Geometría plana'],
                ['codigo' => 'n4', 'obligatoria' => true, 'notas' => 'Geometría plana y sólidos'],
                ['codigo' => 'n5', 'obligatoria' => true, 'notas' => 'Geometría analítica'],
            ],
        ]);

        // Evaluación 3: Cálculo (para niveles n6, n7)
        $eval_calculo = InternadoEvaluacion::create([
            'periodo_id' => $periodo->id,
            'materia_id' => $matematicas->id,
            'nombre' => 'Evaluación: Introducción al Cálculo',
            'descripcion' => 'Límites, derivadas e integrales básicas',
            'peso_porcentual' => 35.00,
            'nota_maxima' => 10.0,
            'fecha_inicio' => '2025-04-01',
            'fecha_fin' => '2025-04-20',
            'permite_credito_extra' => true,
            'credito_extra_max' => 2.0,
            'niveles_aplicables' => [
                ['codigo' => 'n6', 'obligatoria' => true, 'notas' => 'Límites y continuidad'],
                ['codigo' => 'n7', 'obligatoria' => true, 'notas' => 'Derivadas e integrales'],
            ],
        ]);

        // ===== FÍSICA =====
        // Evaluación de Mecánica (niveles intermedios y avanzados)
        $eval_mecanica = InternadoEvaluacion::create([
            'periodo_id' => $periodo->id,
            'materia_id' => $fisica->id,
            'nombre' => 'Evaluación: Mecánica Clásica',
            'descripcion' => 'Cinemática y dinámica',
            'peso_porcentual' => 30.00,
            'nota_maxima' => 10.0,
            'fecha_inicio' => '2025-02-15',
            'fecha_fin' => '2025-03-01',
            'permite_credito_extra' => true,
            'credito_extra_max' => 1.0,
            'niveles_aplicables' => [
                ['codigo' => 'n4', 'obligatoria' => true, 'notas' => 'Cinemática básica'],
                ['codigo' => 'n5', 'obligatoria' => true, 'notas' => 'Cinemática y dinámica'],
                ['codigo' => 'n6', 'obligatoria' => true, 'notas' => 'Leyes de Newton'],
                ['codigo' => 'n7', 'obligatoria' => true, 'notas' => 'Energía y conservación'],
            ],
        ]);

        // ===== QUÍMICA =====
        // Evaluación de Estequiometría (niveles intermedios)
        $eval_estequiometria = InternadoEvaluacion::create([
            'periodo_id' => $periodo->id,
            'materia_id' => $quimica->id,
            'nombre' => 'Evaluación: Estequiometría',
            'descripcion' => 'Cálculos químicos y balanceo de ecuaciones',
            'peso_porcentual' => 25.00,
            'nota_maxima' => 10.0,
            'fecha_inicio' => '2025-03-15',
            'fecha_fin' => '2025-04-01',
            'permite_credito_extra' => false,
            'credito_extra_max' => 0.0,
            'niveles_aplicables' => [
                ['codigo' => 'n3', 'obligatoria' => true, 'notas' => 'Balanceo de ecuaciones'],
                ['codigo' => 'n4', 'obligatoria' => true, 'notas' => 'Cálculos mol-masa'],
                ['codigo' => 'n5', 'obligatoria' => true, 'notas' => 'Reactivo limitante'],
            ],
        ]);

        // ===== BIOLOGÍA =====
        // Evaluación de Genética (niveles avanzados)
        $eval_genetica = InternadoEvaluacion::create([
            'periodo_id' => $periodo->id,
            'materia_id' => $biologia->id,
            'nombre' => 'Evaluación: Genética Mendeliana',
            'descripcion' => 'Herencia y leyes de Mendel',
            'peso_porcentual' => 20.00,
            'nota_maxima' => 10.0,
            'fecha_inicio' => '2025-04-15',
            'fecha_fin' => '2025-05-01',
            'permite_credito_extra' => true,
            'credito_extra_max' => 1.0,
            'niveles_aplicables' => [
                ['codigo' => 'n5', 'obligatoria' => false, 'notas' => 'Introducción a la genética'],
                ['codigo' => 'n6', 'obligatoria' => true, 'notas' => 'Leyes de Mendel'],
                ['codigo' => 'n7', 'obligatoria' => true, 'notas' => 'Genética molecular'],
            ],
        ]);

        $this->command->info('✅ Evaluaciones por nivel creadas exitosamente');
        $this->command->info('   - Matemáticas: 3 evaluaciones para diferentes niveles');
        $this->command->info('   - Física: 1 evaluación para niveles intermedios/avanzados');
        $this->command->info('   - Química: 1 evaluación para niveles intermedios');
        $this->command->info('   - Biología: 1 evaluación para niveles avanzados');
    }
}

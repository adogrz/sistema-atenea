<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla: evaluaciones_fase
 *
 * Representa la participación/evaluación de una inscripción en una fase específica.
 * Regla de unicidad clave: (inscripcion_id, fase_olimpiada_id)
 *  - Garantiza UNA evaluación por inscripción y fase.
 *
 * Campos de estado:
 *  - finalizada: la captura de notas se cerró.
 *  - aprobada: cumple criterios de aprobación (derivado o fijado al cerrar).
 *
 * Índices de consulta:
 *  - inscripcion_id, fase_olimpiada_id (join frecuentes)
 *  - finalizada, aprobada (filtros y conteos)
 *  - calificador_id (si almacenas quién cerró o gestiona)
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('evaluaciones_fase', function (Blueprint $table) {
            $table->id();

            // Relaciones fuertes
            $table->foreignId('inscripcion_id')
                ->constrained('inscripciones_olimpiadas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('fase_olimpiada_id')
                ->constrained('fases_olimpiadas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Quién calificó/cerró (opcional). Ajusta a tu tabla real de usuarios/calificadores:
            $table->foreignId('calificador_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            // Estado y nota total
            $table->boolean('finalizada')->default(false)->comment('1=lista/cerrada');
            $table->boolean('aprobada')->default(false)->comment('1=aprobada según criterio vigente');

            // Nota total. Si usas otro nombre (p.ej. puntaje_total), cámbialo acá y en tu servicio.
            $table->decimal('total', 10, 2)->nullable()->comment('Nota total obtenida');

            // Metadatos opcionales
            $table->timestamp('cerrada_en')->nullable()->comment('Momento de cierre/fin');
            $table->json('metadata')->nullable()->comment('Campos auxiliares (observaciones, versión de rúbrica, etc.)');

            $table->timestamps();

            // Unicidad por inscripción+fase
            $table->unique(['inscripcion_id', 'fase_olimpiada_id'], 'uq_inscripcion_fase');

            // Índices de apoyo
            $table->index('inscripcion_id', 'idx_eval_inscripcion');
            $table->index('fase_olimpiada_id', 'idx_eval_fase');
            $table->index('calificador_id', 'idx_eval_calificador');
            $table->index('finalizada', 'idx_eval_finalizada');
            $table->index('aprobada', 'idx_eval_aprobada');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_fase');
    }
};

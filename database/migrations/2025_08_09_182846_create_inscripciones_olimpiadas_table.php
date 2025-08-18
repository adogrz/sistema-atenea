<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inscripciones_olimpiadas', function (Blueprint $table) {
            $table->id();

            // Relaciones principales
            $table->foreignId('olimpiada_id')
                ->constrained('olimpiadas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('fase_id')
                ->constrained('fases_olimpiadas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Ajustado: usamos codigo string del estudiante
            $table->string('estudiante_codigo');
            $table->foreign('estudiante_codigo')
                ->references('codigo')
                ->on('estudiantes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Estado (obligatorio)
            $table->foreignId('estado_inscripcion_id')
                ->constrained('estados_inscripciones')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Datos de inscripción
            $table->string('codigo', 30)->unique();              // Ej: OLI2025-000045
            $table->dateTime('fecha_inscripcion')->useCurrent();
            $table->boolean('activo')->default(true);
            $table->text('observaciones')->nullable();

            $table->timestamps();

            // Restricción para evitar duplicidad
            $table->unique(['olimpiada_id', 'estudiante_codigo'], 'unq_olimpiada_estudiante');

            // Índices adicionales
            $table->index(['olimpiada_id', 'estado_inscripcion_id'], 'idx_olimpiada_estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscripciones_olimpiadas');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('inscripciones_olimpiadas', function (Blueprint $table) {
            $table->id();

            // Relación con olimpiada
            $table->foreignId('olimpiada_id')
                ->constrained('olimpiadas')
                ->cascadeOnDelete();

            // Relación con estudiante (por código)
            $table->string('estudiante_codigo');
            $table->foreign('estudiante_codigo')
                ->references('codigo')
                ->on('estudiantes')
                ->cascadeOnDelete();

            // Estado de inscripción
            $table->foreignId('estado_inscripcion_id')
                ->constrained('estados_inscripciones')
                ->cascadeOnDelete();

            // Control de timestamps
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

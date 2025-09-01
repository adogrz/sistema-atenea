<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('evaluaciones_fase', function (Blueprint $table) {
            $table->id();

            $table->foreignId('fase_olimpiada_id')
                  ->constrained('fases_olimpiadas')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete()
                  ->comment('Fase a la que pertenece esta evaluación');

            $table->foreignId('inscripcion_id')
                  ->constrained('inscripciones_olimpiadas')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete()
                  ->comment('Inscripción del estudiante evaluado');

            $table->foreignId('calificador_id')
                  ->constrained('users')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete()
                  ->comment('Usuario calificador que realiza esta evaluación');

            $table->enum('estado', ['en_proceso', 'finalizado'])
                  ->default('en_proceso')
                  ->comment('Estado de avance de la evaluación');

            $table->double('total')->nullable()->comment('Nota total obtenida (suma de ítems)');

            $table->timestamps();

            // Prevención de duplicados
            $table->unique(['inscripcion_id', 'calificador_id'], 'uq_inscripcion_calificador');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_fase');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inscripcion_id')
                ->constrained('inscripciones_olimpiadas')
                ->cascadeOnDelete();

            $table->foreignId('fase_olimpiada_id')
                ->constrained('fases_olimpiadas')
                ->cascadeOnDelete();

            $table->foreignId('calificador_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->decimal('total_puntaje', 10, 2)->default(0);
            $table->timestamp('finalizada_at')->nullable();

            $table->timestamps();

            $table->unique(['inscripcion_id', 'fase_olimpiada_id'], 'unq_inscripcion_fase_evaluacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluaciones');
    }
};
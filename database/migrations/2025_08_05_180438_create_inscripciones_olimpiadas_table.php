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
        Schema::create('inscripciones_olimpiadas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_estudiante');
            $table->foreignId('fase_id')->constrained('fases_olimpiadas')->onDelete('cascade');
            $table->dateTime('fecha_inscripcion');
            $table->timestamps();
            // Llaves foráneas
            $table->foreignId('estado_id')
                  ->nullable()
                  ->constrained('estados_inscripciones')
                  ->nullOnDelete(); // si se borra un estado, queda en null
            $table->foreign('codigo_estudiante')->references('codigo')->on('estudiantes')->onDelete('cascade');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones_olimpiadas');
    }
};

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
        Schema::create('evaluaciones_fase', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscripcion_id')->constrained('inscripciones_olimpiadas')->onDelete('cascade');
            $table->enum('estado', ['pendiente', 'completada', 'anulada']);
            $table->dateTime('fecha_evaluacion');
            $table->timestamps();
            // Clave foranea con definiciones_evaluacion
            $table->foreignId('definicion_id')->nullable()->constrained('definiciones_evaluacion')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_fase');
    }
};

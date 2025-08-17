<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Controla qué usuario tiene actualmente "tomada" una evaluación para evitar edición simultánea.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('claims_calificacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluacion_fase_id')->constrained('evaluaciones_fase')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('estado', ['activo', 'liberado'])->default('activo');
            $table->timestamp('expira_en')->nullable();
            $table->timestamps();

            // Solo un claim activo por usuario/evaluación
            $table->unique(['evaluacion_fase_id', 'user_id']);

            // Índices de consulta
            $table->index('user_id');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claims_calificacion');
    }
};

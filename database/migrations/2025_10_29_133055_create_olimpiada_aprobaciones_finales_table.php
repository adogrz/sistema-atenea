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
        Schema::create('olimpiada_aprobaciones_finales', function (Blueprint $table) {
            $table->id();
            $table->string('estudiante_codigo');
            $table->foreign('estudiante_codigo')->references('codigo')->on('estudiantes')->cascadeOnDelete();
            $table->foreignId('olimpiada_id')->constrained('olimpiadas')->cascadeOnDelete();
            $table->foreignId('fase_id')->constrained('fases_olimpiadas')->cascadeOnDelete();
            $table->foreignId('grupo_id')->nullable()->constrained('grupos')->nullOnDelete();
            $table->timestamp('fecha_aprobacion');
            $table->enum('estado_aceptacion', ['pendiente', 'aceptado', 'rechazado'])->default('pendiente');
            $table->timestamps();

            $table->unique(['estudiante_codigo', 'fase_id'], 'unq_estudiante_fase_aprobacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('olimpiada_aprobaciones_finales');
    }
};
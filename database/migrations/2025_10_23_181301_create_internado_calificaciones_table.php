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
        Schema::create('internado_calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluacion_id')->constrained('internado_evaluaciones')->onDelete('cascade');
            $table->foreignId('participante_id')->constrained('internado_participantes')->onDelete('cascade');
            $table->decimal('nota', 3, 1)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Evitar duplicados
            $table->unique(['evaluacion_id', 'participante_id'], 'unique_evaluacion_participante');
            
            // Índices
            $table->index('evaluacion_id');
            $table->index('participante_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internado_calificaciones');
    }
};
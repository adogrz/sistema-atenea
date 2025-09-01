<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Registro de la calificación concreta de cada ítem para una evaluación dada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items_evaluados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluacion_fase_id')->constrained('evaluaciones_fase')->onDelete('cascade');
            $table->foreignId('item_definido_id')->constrained('items_definidos')->onDelete('cascade');
            $table->decimal('puntuacion', 8, 2);
            $table->text('observaciones')->nullable();
            $table->foreignId('calificado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('calificado_en')->nullable();
            $table->timestamps();

            // Evita duplicidad de notas para un mismo ítem/evaluación
            $table->unique(['evaluacion_fase_id', 'item_definido_id']);

            // Índices de consulta
            $table->index('evaluacion_fase_id');
            $table->index('item_definido_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items_evaluados');
    }
};

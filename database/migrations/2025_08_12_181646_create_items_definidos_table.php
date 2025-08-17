<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ítems definidos: criterios/preguntas concretas a calificar por rúbrica.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items_definidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('definicion_evaluacion_id')->constrained('definiciones_evaluacion')->onDelete('cascade');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->decimal('puntaje_maximo', 8, 2);
            $table->integer('orden')->default(0);
            $table->timestamps();

            $table->index('definicion_evaluacion_id'); // para consultas por rúbrica
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items_definidos');
    }
};

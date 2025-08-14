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
        Schema::create('items_definidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('definicion_id')->constrained('definiciones_evaluacion')->onDelete('cascade');
            $table->string('item_codigo'); // Ej: P1, P2
            $table->string('titulo'); // Ej: "Problema de geometría"
            $table->text('descripcion')->nullable(); // Enunciado del problema
            $table->decimal('valor_maximo', 5, 2); // Ej: 10.00
            $table->smallInteger('orden')->default(0); // Ej: 0
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items_definidos');
    }
};

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
        Schema::create('direcciones', function (Blueprint $table) {
            $table->id();
            $table->string('colonia', 100);
            $table->string('calle', 100);
            $table->string('numero_casa', 20);
            $table->string('punto_referencia', 150)->nullable();
            $table->text('direccion_completa')->nullable(); // Para notas adicionales
            $table->foreignId('distrito_id')->constrained('distritos');
            $table->timestamps();

            // Índices para optimizar consultas
            $table->index(['distrito_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('direcciones');
    }
};

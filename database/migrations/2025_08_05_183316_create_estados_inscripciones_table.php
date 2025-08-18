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
        Schema::create('estados_inscripciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();       // p.ej. "pendiente", "aprobada", "rechazada"
            $table->string('slug')->unique();
            $table->string('descripcion', 255)->nullable();
            $table->boolean('es_final')->default(false);  // true si el estado cierra el flujo
            $table->boolean('activo')->default(true);     // para deshabilitar estados sin borrarlos
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estados_inscripciones');
    }
};
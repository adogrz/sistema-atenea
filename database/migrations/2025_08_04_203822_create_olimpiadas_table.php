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
        Schema::create('olimpiadas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');               // Ej: Olimpiada Matemática 2025
            $table->text('descripcion')->nullable();  // Detalles generales
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->foreignId('area_id')->constrained('areas');

            $table->boolean('activa')->default(true); // Control de visibilidad
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('olimpiadas');
    }
};

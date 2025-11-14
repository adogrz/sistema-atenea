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
            $table->foreignId('area_id')->constrained('areas');
            $table->boolean('activa')->default(true); // Control de visibilidad
            $table->foreignId('nivel_educativo_id')->constrained('niveles_educativos', 'codigo')->onDelete('cascade');
            $table->enum('tipo', ['nivel', 'olimpico'])->default('nivel');
            $table->integer('anio')->default(date('Y'));
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

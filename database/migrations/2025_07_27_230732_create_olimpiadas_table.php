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
            $table->id(); // Primary key, auto-incrementing
            $table->string('nombre'); // nombre: String
            $table->date('fecha_inicio'); // fecha_inicio: Date
            $table->date('fecha_fin'); // fecha_fin: Date
            $table->integer('grado_min'); // grado_min: int
            $table->integer('grado_max'); // grado_max: int
            $table->timestamps(); // Adds created_at and updated_at columns
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

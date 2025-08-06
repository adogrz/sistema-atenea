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
        Schema::create('inscripciones_olimpiadas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_estudiante');
            $table->unsignedBigInteger('fase_id');
            $table->unsignedBigInteger('estado');
            $table->boolean('activo')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->foreign('codigo_estudiante')->references('codigo')->on('estudiantes');
            $table->foreign('fase_id')->references('id')->on('fases_olimpiadas')->onDelete('cascade');
            $table->foreign('estado')->references('id')->on('estados');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones_olimpiadas');
    }
};

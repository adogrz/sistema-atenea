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
        Schema::create('municipios', function (Blueprint $table) {
            $table->id('id'); // Equivalente a IDMUNICIPIO
            $table->unsignedBigInteger('id_departamento'); // Clave foránea
            $table->string('nombre_municipio');
            // Clave foránea hacia departamentos
            $table->foreign('id_departamento')->references('id')->on('departamentos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('municipios');
    }
};
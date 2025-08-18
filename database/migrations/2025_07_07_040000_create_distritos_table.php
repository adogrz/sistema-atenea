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
        Schema::create('distritos', function (Blueprint $table) {
            $table->id('id'); // Equivalente a IDDISTRITO
            $table->unsignedBigInteger('id_municipio'); // Clave foránea
            $table->string('nombre_distrito');
            // Relación con municipios
            $table->foreign('id_municipio')
                  ->references('id')
                  ->on('municipios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distritos');
    }
};
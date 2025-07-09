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
        Schema::create('sedes_educativas', function (Blueprint $table) {
            $table->id('codigo');
            $table->timestamps();
            $table->string('municipio');
            $table->string('direccion');
            $table->string('nombre_centro_educativo');
            $table->enum('tipo_de_sede', [
                'Centro educativo oficial',
                'Centro educativo privado',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sedes_educativas');
    }
};

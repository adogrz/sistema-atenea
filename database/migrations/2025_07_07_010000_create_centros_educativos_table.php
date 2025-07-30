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
        Schema::create('centros_educativos', function (Blueprint $table) {
            $table->string('codigo')->primary();
            $table->string('nombre');
            $table->string('departamento');
            $table->string('distrito');
            $table->enum('sector', ['PÚBLICO', 'PRIVADO'])->default('PÚBLICO');
            $table->enum('zona', ['Rural', 'Urbana'])->default('Urbana');
            $table->string('direccion');
            $table->enum('internacional', ['SI', 'NO'])->default('NO');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('centros_educativos');
    }
};
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
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->string('codigo')->primary();
            $table->timestamps();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users');
            $table->string('primer_nombre');
            $table->string('segundo_nombre');
            $table->string('primer_apellido');
            $table->string('segundo_apellido');
            $table->enum('sexo', ['H', 'M']);
            $table->date('fecha_nacimiento');
            $table->string('centro_educativo');
            $table->foreign('centro_educativo')->references('codigo')->on('centros_educativos');
            $table->string('nie')->unique();
            $table->string('telefono_casa')->nullable();
            $table->string('email')->unique();
            $table->string('direccion');
            $table->string('distrito');
            $table->foreign('distrito')->references('id')->on('distritos');
            $table->string('nivel_educativo');
            $table->foreign('nivel_educativo')->references('codigo')->on('niveles_educativos');
            $table->string('nivel')->default('-1');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};

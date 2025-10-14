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
            $table->unsignedBigInteger('user_id');
            $table->string('primer_nombre');
            $table->string('segundo_nombre');
            $table->string('primer_apellido');
            $table->string('segundo_apellido');
            $table->enum('sexo', ['H', 'M']);
            $table->date('fecha_nacimiento');
            $table->string('centro_educativo');
            $table->string('nie')->unique();
            $table->string('telefono_casa')->nullable();
            $table->string('email')->unique();
            $table->string('direccion');
            $table->unsignedSmallInteger('distrito');
            $table->unsignedSmallInteger('nivel_educativo');
            $table->string('nivel')->default('-1');
            $table->boolean('aprobado')->default(false);
            $table->timestamps();
            // Llaves foraneas
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('distrito')->references('id')->on('distritos');
            $table->foreign('nivel_educativo')->references('codigo')->on('niveles_educativos');
            $table->foreign('centro_educativo')->references('codigo')->on('centros_educativos');

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

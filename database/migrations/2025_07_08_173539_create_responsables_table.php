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
        Schema::create('responsables', function (Blueprint $table) {
            $table->id();
            $table->foreign('id_estudiante')->references('id')->on('estudiantes')->onDelete('cascade');
            $table->timestamps();
            $table->string('nombre_responsable');
            $table->string('email_responsable')->unique()->nullable();
            $table->string('telefono_responsable');
            $table->enum('relacion', ['Madre', 'Padre' , 'Abuelo', 'Tio', 'Tutor legal'])->default('Madre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responsables');
    }
};

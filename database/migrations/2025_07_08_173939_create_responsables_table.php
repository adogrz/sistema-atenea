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
            $table->string('dui', 9);
            $table->string('codigo_estudiante');
            $table->foreign('codigo_estudiante')->references('codigo')->on('estudiantes')->onDelete('cascade');
            $table->string('nombres_responsable');
            $table->string('apellidos_responsable');
            $table->string('email_responsable')->nullable();
            $table->string('telefono_responsable');
            $table->enum('tipo_parentesco', ['Madre', 'Padre' , 'Abuelo', 'Tio', 'Tutor legal'])->default('Madre');
            $table->timestamps();
            $table->softDeletes();
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

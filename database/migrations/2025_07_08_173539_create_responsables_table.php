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
            $table->string('dui', 9)->primary();
            $table->foreign('codigo_estudiante')->references('codigo')->on('estudiantes')->onDelete('cascade');
            $table->timestamps();
            $table->string('nombres_responsable');
            $table->string('apellidos_responsable');
            $table->string('email_responsable')->nullable();
            $table->string('telefono_responsable');
            $table->string('telefono_opcional');
            $table->enum('tipo_parentesco', ['Madre', 'Padre' , 'Abuelo', 'Tio', 'Tutor legal'])->default('Madre');
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

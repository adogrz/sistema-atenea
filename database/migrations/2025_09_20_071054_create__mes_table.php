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
        Schema::create('mes', function (Blueprint $table) {

            $table->id('idMes');
            $table->string('nombre', 10);
            $table->date('fechaInicio');
            $table->date('fechaFin');
            $table->date('fechaCierre'); // Fecha de cierre del mes en el sistema.
            $table->timestamps();


            $table->unsignedBigInteger('idNivelEducativo');
            $table->foreign('idNivelEducativo') 
                ->references('codigo') 
                ->on('niveles_educativos') 
                ->onDelete('cascade'); 
        });
        
    }

    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mes');
    }
};

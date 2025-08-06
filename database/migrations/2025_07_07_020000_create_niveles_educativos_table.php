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
        Schema::create('niveles_educativos', function (Blueprint $table) {
            $table->id('codigo');
            $table->string('descripcion');
            $table->string('nivel');
            $table->string('id_sede');
            $table->foreign('id_sede')->references('name')->on('sedes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('niveles_educativos');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internado_conductas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participante_id')->constrained('internado_participantes')->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained('internado_periodos')->onDelete('cascade');
            $table->unsignedBigInteger('nivel_codigo')->nullable();
            $table->foreign('nivel_codigo')->references('codigo')->on('niveles_educativos')->onDelete('set null');
            $table->enum('calificacion', ['excelente', 'buena', 'regular', 'mala'])->default('buena');
            $table->text('descripcion')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['participante_id', 'periodo_id']);
            $table->index(['nivel_codigo', 'periodo_id']);
            $table->index('calificacion');
            
            $table->unique(['participante_id', 'periodo_id'], 'unique_conducta_periodo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internado_conductas');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internado_asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participante_id')->constrained('internado_participantes')->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained('internado_periodos')->onDelete('cascade');
            $table->date('fecha');
            $table->enum('estado', ['presente', 'ausente', 'justificada'])->default('presente');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['participante_id', 'periodo_id']);
            $table->index('fecha');
            $table->unique(['participante_id', 'fecha'], 'unique_asistencia_dia');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internado_asistencias');
    }
};
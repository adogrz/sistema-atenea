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
        Schema::table('fases_olimpiadas', function (Blueprint $table) {
            $table->foreignId('definicion_evaluacion_id')
                ->nullable()
                ->constrained('definiciones_evaluacion')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fases_olimpiadas', function (Blueprint $table) {
            $table->dropForeign(['definicion_evaluacion_id']);
            $table->dropColumn('definicion_evaluacion_id');
        });
    }
};
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
        Schema::table('evaluaciones', function (Blueprint $table) {
            // Remove calificador_id from evaluaciones
            $table->dropConstrainedForeignId('calificador_id');

            // Add estado column to evaluaciones
            $table->string('estado')->default('finalizada')->after('finalizada_at');
        });

        Schema::table('items_evaluados', function (Blueprint $table) {
            // Add calificador_id to items_evaluados
            $table->foreignId('calificador_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->after('puntaje');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items_evaluados', function (Blueprint $table) {
            $table->dropConstrainedForeignId('calificador_id');
        });

        Schema::table('evaluaciones', function (Blueprint $table) {
            $table->dropColumn('estado');
            // Re-add calificador_id for proper rollback
            $table->foreignId('calificador_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
        });
    }
};
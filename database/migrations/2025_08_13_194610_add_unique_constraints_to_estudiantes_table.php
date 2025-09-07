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
        // Para SQLite, simplemente intentamos agregar los índices y manejamos la excepción
        try {
            Schema::table('estudiantes', function (Blueprint $table) {
                $table->unique('email');
            });
        } catch (\Exception $e) {
            // El índice ya existe, continuar
        }

        try {
            Schema::table('estudiantes', function (Blueprint $table) {
                $table->unique('nie');
            });
        } catch (\Exception $e) {
            // El índice ya existe, continuar
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estudiantes', function (Blueprint $table) {
            // Eliminar los índices únicos
            $table->dropUnique(['email']);
            $table->dropUnique(['nie']);
        });
    }
};

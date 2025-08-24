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
        // Los campos legacy no existen en este ambiente de desarrollo
        // Esta migración se mantiene por consistencia pero no hace nada
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hay campos legacy que recrear en este ambiente
    }
};

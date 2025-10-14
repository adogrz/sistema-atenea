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
        // Migración redundante - el trabajo se hace en clean_estudiantes_table_remove_legacy_fields
        // Se mantiene por historial pero no hace nada
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nada que revertir
    }
};

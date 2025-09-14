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
        Schema::table('calificador_item_asignado', function (Blueprint $table) {
            $table->dropUnique('calificador_item_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calificador_item_asignado', function (Blueprint $table) {
            $table->unique(['calificador_id', 'fase_olimpiada_id', 'item_definido_id'], 'calificador_item_unique');
        });
    }
};

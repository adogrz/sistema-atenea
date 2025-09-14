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
        Schema::table('items_definidos', function (Blueprint $table) {
            $table->foreignId('fase_olimpiada_id')
                ->nullable()
                ->constrained('fases_olimpiadas')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items_definidos', function (Blueprint $table) {
            $table->dropForeign(['fase_olimpiada_id']);
            $table->dropColumn('fase_olimpiada_id');
        });
    }
};
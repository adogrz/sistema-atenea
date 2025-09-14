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
        Schema::create('calificador_item_asignado', function (Blueprint $table) {
            $table->id();

            $table->foreignId('calificador_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('fase_olimpiada_id')->constrained('fases_olimpiadas')->cascadeOnDelete();
            $table->foreignId('item_definido_id')->constrained('items_definidos')->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['calificador_id', 'fase_olimpiada_id', 'item_definido_id'], 'calificador_item_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calificador_item_asignado');
    }
};
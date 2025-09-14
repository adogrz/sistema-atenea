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
        Schema::create('items_evaluados', function (Blueprint $table) {
            $table->id();

            $table->foreignId('evaluacion_id')
                ->constrained('evaluaciones')
                ->cascadeOnDelete();

            $table->foreignId('item_definido_id')
                ->constrained('items_definidos')
                ->cascadeOnDelete();

            $table->decimal('puntaje', 10, 2)->default(0);
            $table->text('observacion')->nullable();

            $table->timestamps();

            $table->unique(['evaluacion_id', 'item_definido_id'], 'unq_evaluacion_item_definido');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items_evaluados');
    }
};
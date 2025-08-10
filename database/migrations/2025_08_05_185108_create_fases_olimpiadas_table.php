<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fases_olimpiadas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('olimpiada_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('numero_fase'); // Para orden lógico
            $table->string('nombre');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('activa')->default(true);
            $table->text('descripcion')->nullable();
            $table->timestamps();
            //$table->softDeletes();
            $table->unique(['olimpiada_id', 'numero_fase']); // Evita duplicados por olimpiada
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fases_olimpiadas');
    }
};

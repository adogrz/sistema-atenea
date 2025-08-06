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
            $table->unsignedBigInteger('olimpiada_id'); // FK hacia olimpiadas
            $table->string('nombre');                  // Ej: "Fase Regional", "Fase Nacional"
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->decimal('nota_minima', 5, 2)->nullable();
            $table->string('modalidad')->nullable();   // Ej: "Presencial", "Virtual"
            $table->boolean('activa')->default(true);
            $table->text('descripcion')->nullable();
            $table->timestamps();

            $table->foreign('olimpiada_id')->references('id')->on('olimpiadas')->onDelete('cascade');
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

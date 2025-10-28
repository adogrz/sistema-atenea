<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fases_olimpiadas', function (Blueprint $table) {
            $table->id();

            // Relación con olimpiada
            $table->foreignId('olimpiada_id')
                ->constrained('olimpiadas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Identificación de la fase
            $table->string('nombre', 120);               // Ej: "Fase Municipal", "Fase Nacional"
            $table->unsignedTinyInteger('orden')->default(1); // Posición secuencial (1,2,3...)

            // Campos de gestión de fase
            $table->integer('cupos')->nullable();
            $table->decimal('nota_minima_aprobacion', 5, 2)->nullable();
            $table->timestamp('fecha_inicio_inscripcion')->nullable();
            $table->timestamp('fecha_fin_inscripcion')->nullable();
            $table->boolean('resultados_publicados')->default(false);
            $table->foreignId('definicion_evaluacion_id')
                ->nullable()
                ->constrained('definiciones_evaluacion')
                ->nullOnDelete();

            // Control del estado y ventana temporal

            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_fin')->nullable();

            // Control de uso y observaciones
            $table->boolean('activa')->default(true);
            $table->text('observaciones')->nullable();

            $table->timestamps();

            // Evitar fases duplicadas en la misma olimpiada
            $table->unique(['olimpiada_id', 'orden'], 'unq_olimpiada_orden');
            $table->unique(['olimpiada_id', 'nombre'], 'unq_olimpiada_nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fases_olimpiadas');
    }
};

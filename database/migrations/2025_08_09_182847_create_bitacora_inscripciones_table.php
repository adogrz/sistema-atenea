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
        Schema::create('bitacora_inscripciones', function (Blueprint $table) {
            $table->id();

            // No usamos cascadeOnDelete para preservar auditoría si se borra definitivamente;
            // si usas SoftDeletes en inscripciones, funcionará sin problemas.
            $table->foreignId('inscripcion_id')
                  ->constrained('inscripciones_olimpiadas');

            // Usuario responsable (nullable); si el usuario se elimina, deja null para conservar el registro.
            $table->foreignId('usuario_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->enum('accion', ['inscripcion', 'desinscripcion']);

            $table->timestamps();

            // Índices útiles para consultas frecuentes
            $table->index('inscripcion_id');
            $table->index('usuario_id');
            $table->index(['inscripcion_id', 'accion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bitacora_inscripciones');
    }
};

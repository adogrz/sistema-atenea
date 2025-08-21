<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla de bloqueo (claim) para evitar edición concurrente de una inscripción.
     * - Un claim por inscripción (UNIQUE).
     * - Se expira por tiempo (locked_until) y se renueva vía heartbeat.
     */
    public function up(): void
    {
        Schema::create('claims_calificacion', function (Blueprint $table) {
            $table->id();

            // Inscripción reclamada (una sola a la vez)
            $table->foreignId('inscripcion_id')
                ->constrained('inscripciones_olimpiadas')
                ->cascadeOnDelete();

            // Calificador que posee el claim
            $table->foreignId('calificador_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Expiración del claim (TTL). Usa timestampTz si tu BD lo soporta.
            $table->timestamp('locked_until');

            $table->timestamps();

            // Garantiza un claim por inscripción
            $table->unique('inscripcion_id', 'claims_inscripcion_unique');

            // Ayuda a consultas del tipo: WHERE calificador_id <> ? AND locked_until > NOW()
            $table->index(['calificador_id', 'locked_until'], 'claims_calif_locked_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claims_calificacion');
    }
};

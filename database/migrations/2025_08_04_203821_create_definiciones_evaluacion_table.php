<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('definiciones_evaluacion', function (Blueprint $table) {
            $table->id();

            // Datos de identificación
            $table->string('nombre');                   // Ej: "Evaluación Matemáticas Fase 1"
            $table->text('descripcion')->nullable();    // Descripción opcional
            $table->unsignedInteger('version')->default(1); // Permite versionado

            // Control de publicación
            $table->enum('estado', ['borrador','publicada','archivada'])->default('borrador');
            $table->boolean('bloqueada')->default(false);  // Impide edición si está publicada

            // Auditoría: quién la creó
            $table->foreignId('creada_por')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();

            // Evita duplicados de nombre+versión
            $table->unique(['nombre', 'version'], 'unq_nombre_version');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('definiciones_evaluacion');
    }
};

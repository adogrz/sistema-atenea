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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->string('student_nie');
            $table->foreignId('professional_id')->constrained('users');
            $table->enum('type', ['medical', 'psychological']);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('student_nie')->references('nie')->on('estudiantes');

            // Index para optimizacion de consultas
            $table->index(['professional_id', 'is_active']);
            $table->index(['student_nie', 'type']);
            $table->index(['type', 'is_active']);

            // Constraint único: Un estudiante no puede tener duplicados activos del mismo tipo
            $table->index(['student_nie', 'type', 'is_active', 'deleted_at'], 'idx_unique_check');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};

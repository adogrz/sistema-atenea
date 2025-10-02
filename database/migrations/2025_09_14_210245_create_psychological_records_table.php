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
        Schema::create('psychological_records', function (Blueprint $table) {
            $table->id();
            $table->string('student_nie')->unique();
            $table->text('initial_assessment')->nullable(); // Para evaluación inicial, historial de desarrollo, etc.
            $table->foreignId('created_by')->constrained('users');
            $table->text('change_justification')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('student_nie')->references('nie')->on('estudiantes');

            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psychological_records');
    }
};

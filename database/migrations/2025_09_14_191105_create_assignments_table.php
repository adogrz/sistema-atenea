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
            $table->string('type'); // 'clinico' o 'psicologico'
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('student_nie')->references('nie')->on('estudiantes');
            $table->unique(['student_nie', 'professional_id', 'type']);
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

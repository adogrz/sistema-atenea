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
        Schema::create('consent_forms', function (Blueprint $table) {
            $table->id();
            $table->string('student_nie');
            $table->foreignId('responsible_id')->constrained('responsables');
            $table->foreignId('professional_id')->constrained('users');
            $table->enum('type', ['medical', 'psychological']);
            $table->date('granted_at');
            $table->string('file_path')->nullable();
            $table->text('observations')->nullable();
            $table->text('change_justification')->nullable(); // Justificación de cambios críticos (auditoría)
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('student_nie')->references('nie')->on('estudiantes');

            $table->index(['student_nie', 'type', 'granted_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consent_forms');
    }
};

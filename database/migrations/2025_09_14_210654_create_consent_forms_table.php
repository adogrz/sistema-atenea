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
            $table->string('type'); // 'medical' o 'psychological'
            $table->date('granted_at');
            $table->string('file_path'); // Ruta al archivo almacenado en `storage`
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->foreign('student_nie')->references('nie')->on('estudiantes');
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

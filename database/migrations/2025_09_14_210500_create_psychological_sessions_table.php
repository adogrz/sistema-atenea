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
        Schema::create('psychological_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psychological_record_id')->constrained('psychological_records')->onDelete('cascade');
            $table->foreignId('psychologist_id')->constrained('users');
            $table->foreignId('consent_form_id')->nullable()->constrained('consent_forms');
            $table->timestamp('session_date');
            $table->text('session_content');
            $table->text('test_results')->nullable(); // Resultados de pruebas psicológicas
            $table->text('observations')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('session_date');
            $table->index(['psychological_record_id', 'session_date']);
            $table->index(['psychologist_id', 'session_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psychological_sessions');
    }
};

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
        Schema::create('medical_consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users');
            $table->foreignId('consent_form_id')->nullable()->constrained('consent_forms');
            $table->timestamp('consultation_date');
            $table->text('diagnosis');
            $table->text('treatment')->nullable();
            $table->text('observations')->nullable();
            $table->text('change_justification')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('consultation_date');
            $table->index(['medical_record_id', 'consultation_date']);
            $table->index(['doctor_id', 'consultation_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_consultations');
    }
};

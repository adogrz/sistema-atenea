<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Creates the 'sedes' table with columns for id, name, description, and timestamps.
     */
    public function up(): void
    {
        Schema::create('sedes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->timestamps();
        });
    }

    /**
     * Drops the 'sedes' table if it exists, reversing the migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('sedes');
    }
};

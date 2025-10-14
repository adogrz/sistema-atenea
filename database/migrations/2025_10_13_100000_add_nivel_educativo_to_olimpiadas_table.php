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
        Schema::table('olimpiadas', function (Blueprint $table) {
            $table->foreignId('nivel_educativo_id')->nullable()->constrained('niveles_educativos', 'codigo')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('olimpiadas', function (Blueprint $table) {
            $table->dropForeign(['nivel_educativo_id']);
            $table->dropColumn('nivel_educativo_id');
        });
    }
};

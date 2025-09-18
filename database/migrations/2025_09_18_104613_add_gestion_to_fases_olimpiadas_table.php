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
        Schema::table('fases_olimpiadas', function (Blueprint $table) {
            $table->integer('cupos')->nullable()->after('orden');
            $table->decimal('nota_minima_aprobacion', 5, 2)->nullable()->after('cupos');
            $table->timestamp('fecha_inicio_inscripcion')->nullable()->after('nota_minima_aprobacion');
            $table->timestamp('fecha_fin_inscripcion')->nullable()->after('fecha_inicio_inscripcion');
            $table->boolean('resultados_publicados')->default(false)->after('fecha_fin_inscripcion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fases_olimpiadas', function (Blueprint $table) {
            $table->dropColumn([
                'cupos',
                'nota_minima_aprobacion',
                'fecha_inicio_inscripcion',
                'fecha_fin_inscripcion',
                'resultados_publicados',
            ]);
        });
    }
};

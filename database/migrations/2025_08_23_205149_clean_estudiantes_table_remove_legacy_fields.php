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
        Schema::table('estudiantes', function (Blueprint $table) {
            // Eliminar foreign key constraints primero
            $table->dropForeign(['distrito']);

            // Eliminar campos legacy que ya no necesitamos
            $table->dropColumn([
                'direccion',      // Campo de dirección como texto
                'distrito',       // Referencia directa a distritos (ahora va via direcciones)
                'calle',          // Campos estructurados que ahora están en direcciones
                'numero_casa',
                'punto_referencia'
            ]);

            // Hacer direccion_id NOT NULL ya que es requerido
            $table->foreignId('direccion_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estudiantes', function (Blueprint $table) {
            // Revertir cambios
            $table->foreignId('direccion_id')->nullable()->change();

            // Recrear campos legacy
            $table->text('direccion')->nullable();
            $table->string('calle', 100)->nullable();
            $table->string('numero_casa', 20)->nullable();
            $table->string('punto_referencia', 150)->nullable();
            $table->unsignedBigInteger('distrito')->nullable();

            // Recrear foreign key
            $table->foreign('distrito')->references('id')->on('distritos');
        });
    }
};

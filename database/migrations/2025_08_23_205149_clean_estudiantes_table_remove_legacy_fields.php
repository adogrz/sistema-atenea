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
            // Verificar qué columnas existen antes de eliminarlas
            $columnsToCheck = ['direccion', 'distrito', 'calle', 'numero_casa', 'punto_referencia'];
            $existingColumns = [];

            foreach ($columnsToCheck as $column) {
                if (Schema::hasColumn('estudiantes', $column)) {
                    $existingColumns[] = $column;
                }
            }

            // Eliminar foreign key constraints si existe la columna distrito
            if (in_array('distrito', $existingColumns)) {
                $table->dropForeign(['distrito']);
            }

            // Eliminar solo las columnas que realmente existen
            if (!empty($existingColumns)) {
                $table->dropColumn($existingColumns);
            }

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

            // Recrear solo los campos que existían originalmente según la tabla base
            $table->text('direccion')->nullable();
            $table->unsignedBigInteger('distrito')->nullable();

            // Recrear foreign key para distrito
            $table->foreign('distrito')->references('id')->on('distritos');
        });
    }
};

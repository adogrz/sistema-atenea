<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('estudiantes', function (Blueprint $table) {
            // Agregar campos estructurados de dirección - inicialmente nullable
            // (colonia ya existe, solo agregamos los que faltan)
            $table->string('calle', 100)->nullable()->after('colonia');
            $table->string('numero_casa', 20)->nullable()->after('calle');
            $table->string('punto_referencia', 150)->nullable()->after('numero_casa');
        });

        // Después de agregar las columnas, actualizar las existentes con valores por defecto
        DB::table('estudiantes')->update([
            'calle' => 'Por actualizar',
            'punto_referencia' => 'Por actualizar'
        ]);

        // Ahora hacer NOT NULL los campos requeridos
        Schema::table('estudiantes', function (Blueprint $table) {
            $table->string('calle', 100)->nullable(false)->change();
            $table->string('punto_referencia', 150)->nullable(false)->change();

            // Cambiar el campo direccion existente para hacerlo nullable (será para notas adicionales)
            $table->text('direccion')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('estudiantes', function (Blueprint $table) {
            // Eliminar los campos estructurados agregados (mantenemos colonia ya que existía)
            $table->dropColumn(['calle', 'numero_casa', 'punto_referencia']);

            // Revertir el campo direccion a su estado original
            $table->string('direccion')->nullable(false)->change();
        });
    }
};

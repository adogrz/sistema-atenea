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
        Schema::table('responsables', function (Blueprint $table) {
            // Actualizar el enum para incluir 'Otro'
            $table->enum('tipo_parentesco', ['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal', 'Otro'])->default('Madre')->change();

            // Agregar campo para especificar otro tipo de parentesco
            $table->string('otro_parentesco', 50)->nullable()->after('tipo_parentesco');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('responsables', function (Blueprint $table) {
            // Eliminar el campo nuevo
            $table->dropColumn('otro_parentesco');

            // Revertir el enum al estado anterior
            $table->enum('tipo_parentesco', ['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal'])->default('Madre')->change();
        });
    }
};

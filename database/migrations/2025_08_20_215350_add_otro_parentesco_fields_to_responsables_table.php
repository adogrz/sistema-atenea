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
        Schema::table('responsables', function (Blueprint $table) {
            // Agregar campo para especificar otro tipo de parentesco
            $table->string('otro_parentesco', 50)->nullable()->after('tipo_parentesco');
        });

        // Para PostgreSQL, necesitamos manejar el enum de forma diferente
        if (config('database.default') === 'pgsql') {
            // Primero, eliminamos el constraint existente
            DB::statement('ALTER TABLE responsables DROP CONSTRAINT IF EXISTS responsables_tipo_parentesco_check');

            // Luego, creamos un nuevo constraint con todos los valores
            DB::statement("ALTER TABLE responsables ADD CONSTRAINT responsables_tipo_parentesco_check CHECK (tipo_parentesco IN ('Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal', 'Otro'))");
        } else {
            // Para otros motores de BD (MySQL, SQLite)
            Schema::table('responsables', function (Blueprint $table) {
                $table->enum('tipo_parentesco', ['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal', 'Otro'])->default('Madre')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('responsables', function (Blueprint $table) {
            // Eliminar el campo nuevo
            $table->dropColumn('otro_parentesco');
        });

        // Restaurar el constraint original para PostgreSQL
        if (config('database.default') === 'pgsql') {
            DB::statement('ALTER TABLE responsables DROP CONSTRAINT IF EXISTS responsables_tipo_parentesco_check');
            DB::statement("ALTER TABLE responsables ADD CONSTRAINT responsables_tipo_parentesco_check CHECK (tipo_parentesco IN ('Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal'))");
        } else {
            Schema::table('responsables', function (Blueprint $table) {
                $table->enum('tipo_parentesco', ['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal'])->default('Madre')->change();
            });
        }
    }
};

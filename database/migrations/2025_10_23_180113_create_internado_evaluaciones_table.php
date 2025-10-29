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
        Schema::create('internado_evaluaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->decimal('peso_porcentual', 5, 2)->default(0);
            $table->decimal('nota_maxima', 3, 1)->default(10.0);
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->boolean('permite_credito_extra')->default(false);
            $table->decimal('credito_extra_max', 3, 1)->default(0);
            $table->foreignId('periodo_id')->after('id')->nullable()->constrained('internado_periodos')->onDelete('cascade');
            $table->foreignId('materia_id')->after('periodo_id')->nullable()->constrained('materias')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internado_evaluaciones');
    }
};
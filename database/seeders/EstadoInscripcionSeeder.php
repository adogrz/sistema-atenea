<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EstadoInscripcionSeeder extends Seeder
{
    public function run(): void
    {
        $table = 'estados_inscripciones';

        // Estados base
        $rows = [
            ['nombre' => 'Preinscrito', 'slug' => 'preinscrito', 'codigo' => 'PRE', 'descripcion' => 'Registro preliminar, pendiente de validación', 'orden' => 1, 'activo' => 1],
            ['nombre' => 'Inscrito',    'slug' => 'inscrito',    'codigo' => 'INS', 'descripcion' => 'Inscripción confirmada y vigente',         'orden' => 2, 'activo' => 1],
            ['nombre' => 'Retiro',      'slug' => 'retiro',      'codigo' => 'RET', 'descripcion' => 'Participante retirado voluntariamente',     'orden' => 3, 'activo' => 1],
            ['nombre' => 'Anulado',     'slug' => 'anulado',     'codigo' => 'ANU', 'descripcion' => 'Inscripción anulada por administración',    'orden' => 4, 'activo' => 0],
        ];

        // Detectar columnas disponibles
        $cols = Schema::getColumnListing($table);

        // Campos mínimos obligatorios
        $hasNombre = in_array('nombre', $cols);

        if (!$hasNombre) {
            $this->command?->error("EstadosInscripcionSeeder: la tabla '{$table}' no tiene columna 'nombre'. Ajusta el seeder a tu esquema.");
            return;
        }

        $hasSlug        = in_array('slug', $cols);
        $hasCodigo      = in_array('codigo', $cols);
        $hasDescripcion = in_array('descripcion', $cols);
        $hasOrden       = in_array('orden', $cols);
        $hasActivo      = in_array('activo', $cols);

        // Preparar payload filtrando a las columnas existentes
        $payload = array_map(function ($r) use ($hasSlug, $hasCodigo, $hasDescripcion, $hasOrden, $hasActivo) {
            $row = ['nombre' => $r['nombre']];
            if ($hasSlug)        { $row['slug']        = $r['slug']; }
            if ($hasCodigo)      { $row['codigo']      = $r['codigo']; }
            if ($hasDescripcion) { $row['descripcion'] = $r['descripcion']; }
            if ($hasOrden)       { $row['orden']       = $r['orden']; }
            if ($hasActivo)      { $row['activo']      = $r['activo']; }
            $row['created_at'] = now();
            $row['updated_at'] = now();
            return $row;
        }, $rows);

        // Clave de upsert: intentamos por 'codigo', si no existe, por 'slug'; si no, por 'nombre'
        $uniqueBy = $hasCodigo ? ['codigo'] : ($hasSlug ? ['slug'] : ['nombre']);

        DB::table($table)->upsert(
            $payload,
            $uniqueBy,
            // columnas a actualizar (todas salvo la/s clave/s única/s y created_at)
            array_values(array_diff(
                array_keys($payload[0]),
                array_merge($uniqueBy, ['created_at'])
            ))
        );

        $this->command?->info('EstadosInscripcionSeeder: estados sembrados/actualizados correctamente.');
    }
}

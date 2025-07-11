<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartamentoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insertar los departamentos en la tabla 'departamentos'
        // Asegúrate de hacer las migraciones antes de ejecutar este seeder
        DB::table('departamentos')->insert([
            ['id' => 1, 'nombre_departamento' => 'Ahuachapán'],
            ['id' => 2, 'nombre_departamento' => 'San Salvador'],
            ['id' => 3, 'nombre_departamento' => 'La Libertad'],
            ['id' => 4, 'nombre_departamento' => 'Chalatenango'],
            ['id' => 5, 'nombre_departamento' => 'Cuscatlán'],
            ['id' => 6, 'nombre_departamento' => 'Cabañas'],
            ['id' => 7, 'nombre_departamento' => 'La Paz'],
            ['id' => 8, 'nombre_departamento' => 'La Unión'],
            ['id' => 9, 'nombre_departamento' => 'Usulután'],
            ['id' => 10, 'nombre_departamento' => 'Sonsonate'],
            ['id' => 11, 'nombre_departamento' => 'Santa Ana'],
            ['id' => 12, 'nombre_departamento' => 'San Vicente'],
            ['id' => 13, 'nombre_departamento' => 'San Miguel'],
            ['id' => 14, 'nombre_departamento' => 'Morazán'],
        ]);
    }
}
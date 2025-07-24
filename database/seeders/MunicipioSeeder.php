<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MunicipioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Inserta los datos en la tabla 'municipios'. 
        DB::table('municipios')->insert([
            ['id' => 1, 'id_departamento' => 1, 'nombre_municipio' => 'Ahuachapán Norte'],
            ['id' => 2, 'id_departamento' => 1, 'nombre_municipio' => 'Ahuachapán Centro'],
            ['id' => 3, 'id_departamento' => 1, 'nombre_municipio' => 'Ahuachapán Sur'],
            ['id' => 4, 'id_departamento' => 2, 'nombre_municipio' => 'San Salvador Norte'],
            ['id' => 5, 'id_departamento' => 2, 'nombre_municipio' => 'San Salvador Oeste'],
            ['id' => 6, 'id_departamento' => 2, 'nombre_municipio' => 'San Salvador Este'],
            ['id' => 7, 'id_departamento' => 2, 'nombre_municipio' => 'San Salvador Centro'],
            ['id' => 8, 'id_departamento' => 2, 'nombre_municipio' => 'San Salvador Sur'],
            ['id' => 9, 'id_departamento' => 3, 'nombre_municipio' => 'Libertad Norte'],
            ['id' => 10, 'id_departamento' => 3, 'nombre_municipio' => 'La Libertad Centro'],
            ['id' => 11, 'id_departamento' => 3, 'nombre_municipio' => 'La Libertad Oeste'],
            ['id' => 12, 'id_departamento' => 3, 'nombre_municipio' => 'La Libertad Este'],
            ['id' => 13, 'id_departamento' => 3, 'nombre_municipio' => 'La Libertad Costa'],
            ['id' => 14, 'id_departamento' => 3, 'nombre_municipio' => 'La Libertad Sur'],
            ['id' => 15, 'id_departamento' => 4, 'nombre_municipio' => 'Chalatenango Norte'],
            ['id' => 16, 'id_departamento' => 4, 'nombre_municipio' => 'Chalatenango Centro'],
            ['id' => 17, 'id_departamento' => 4, 'nombre_municipio' => 'Chalatenango Sur'],
            ['id' => 18, 'id_departamento' => 5, 'nombre_municipio' => 'Cuscatlán Norte'],
            ['id' => 19, 'id_departamento' => 5, 'nombre_municipio' => 'Cuscatlán Sur'],
            ['id' => 20, 'id_departamento' => 6, 'nombre_municipio' => 'Cabañas Este'],
            ['id' => 21, 'id_departamento' => 6, 'nombre_municipio' => 'Cabañas Oeste'],
            ['id' => 22, 'id_departamento' => 7, 'nombre_municipio' => 'La Paz Oeste'],
            ['id' => 23, 'id_departamento' => 7, 'nombre_municipio' => 'La Paz Centro'],
            ['id' => 24, 'id_departamento' => 7, 'nombre_municipio' => 'La Paz Este'],
            ['id' => 25, 'id_departamento' => 8, 'nombre_municipio' => 'La Unión Norte'],
            ['id' => 26, 'id_departamento' => 8, 'nombre_municipio' => 'La Unión Sur'],
            ['id' => 27, 'id_departamento' => 9, 'nombre_municipio' => 'Usulután Norte'],
            ['id' => 28, 'id_departamento' => 9, 'nombre_municipio' => 'Usulután Este'],
            ['id' => 29, 'id_departamento' => 9, 'nombre_municipio' => 'Usulután Oeste'],
            ['id' => 30, 'id_departamento' => 10, 'nombre_municipio' => 'Sonsonate Norte'],
            ['id' => 31, 'id_departamento' => 10, 'nombre_municipio' => 'Sonsonate Centro'],
            ['id' => 32, 'id_departamento' => 10, 'nombre_municipio' => 'Sonsonate Este'],
            ['id' => 33, 'id_departamento' => 10, 'nombre_municipio' => 'Sonsonate Oeste'],
            ['id' => 34, 'id_departamento' => 11, 'nombre_municipio' => 'Santa Ana Norte'],
            ['id' => 35, 'id_departamento' => 11, 'nombre_municipio' => 'Santa Ana Centro'],
            ['id' => 36, 'id_departamento' => 11, 'nombre_municipio' => 'Santa Ana Este'],
            ['id' => 37, 'id_departamento' => 11, 'nombre_municipio' => 'Santa Ana Oeste'],
            ['id' => 38, 'id_departamento' => 12, 'nombre_municipio' => 'San Vicente Norte'],
            ['id' => 39, 'id_departamento' => 12, 'nombre_municipio' => 'San Vicente Sur'],
            ['id' => 40, 'id_departamento' => 13, 'nombre_municipio' => 'San Miguel Norte'],
            ['id' => 41, 'id_departamento' => 13, 'nombre_municipio' => 'San Miguel Centro'],
            ['id' => 42, 'id_departamento' => 13, 'nombre_municipio' => 'San Miguel Oeste'],
            ['id' => 43, 'id_departamento' => 14, 'nombre_municipio' => 'Morazán Norte'],
            ['id' => 44, 'id_departamento' => 14, 'nombre_municipio' => 'Morazán Sur'],
        ]);
    }
}

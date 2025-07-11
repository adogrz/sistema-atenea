<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            SedeSeeder::class,
            AreaSeeder::class,
            UserSeeder::class,
            DepartamentoSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
        ]);
    }
}

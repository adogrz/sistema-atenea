<?php

namespace Database\Seeders;

use App\Models\Estudiante;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            SedeSeeder::class,
            AreaSeeder::class,
            DepartamentoSeeder::class,
            MunicipioSeeder::class,
            DistritoSeeder::class,
            NivelEducativoSeeder::class,
            OlimpiadaSeeder::class,
            FaseOlimpiadaSeeder::class,
            EssentialUserSeeder::class,
        ]);
    }
}

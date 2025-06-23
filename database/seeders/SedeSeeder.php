<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sede;

class SedeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sedes = [
            'central' => 'Sede Central',
            'occidental' => 'Sede Occidental',
            'oriental' => 'Sede Oriental',
        ];

        foreach ($sedes as $key => $description) {
            Sede::firstOrCreate(
                ['name' => $key],
                ['description' => $description]
            );
        }
    }
}

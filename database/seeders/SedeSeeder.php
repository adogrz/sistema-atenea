<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sede;

class SedeSeeder extends Seeder
{
    /**
     * Seeds the database with initial Sede records if they do not already exist.
     *
     * Creates entries for 'central', 'occidental', and 'oriental' sedes with their respective descriptions.
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

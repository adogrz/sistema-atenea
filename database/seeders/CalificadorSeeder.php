<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Area;

class CalificadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Nota: La asociación de un calificador a un área no es directa.
        // Se realiza a través de la asignación de ítems de una fase de olimpiada,
        // y la olimpiada a su vez pertenece a un área.

        // 1. Calificador para el área de Matemática
        $calificadorMatematica1 = User::updateOrCreate(
            ['email' => 'calificador.mat1@atenea.com'],
            [
                'name' => 'Calificador Matematica 1',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'central',
                'status' => 'active',
            ]
        );
        $calificadorMatematica1->syncRolesWithExpiration([
            ['name' => 'calificador', 'is_primary' => true, 'expires_at' => null],
        ]);

        // 2. Calificador para el área de Matemática
        $calificadorMatematica2 = User::updateOrCreate(
            ['email' => 'calificador.mat2@atenea.com'],
            [
                'name' => 'Calificador Matematica 2',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'sede_name' => 'central',
                'status' => 'active',
            ]
        );
        $calificadorMatematica2->syncRolesWithExpiration([
            ['name' => 'calificador', 'is_primary' => true, 'expires_at' => null],
        ]);

        $this->command->info("\n🎉 Se han creado 2 calificadores de prueba para el área de matemática.");
        $this->command->info("Correos: calificador.mat1@atenea.com, calificador.mat2@atenea.com");
        $this->command->info("Contraseña para todos: password123");
    }
}

<?php

namespace Database\Factories;

use App\Models\Direccion;
use App\Models\Distrito;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Direccion>
 */
class DireccionFactory extends Factory
{
    protected $model = Direccion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $distrito = Distrito::inRandomOrder()->first();

        $colonias = [
            'Colonia Escalón',
            'Colonia San Benito',
            'Colonia Miramonte',
            'Colonia Centroamérica',
            'Colonia Flor Blanca',
            'Colonia Maquilishuat',
            'Colonia Los Robles',
            'Colonia Jardines de Guadalupe',
            'Colonia San Francisco',
            'Colonia Buenos Aires'
        ];

        $calles = [
            'Avenida Principal',
            'Calle Los Naranjos',
            'Pasaje Central',
            'Boulevard Los Héroes',
            'Calle San Antonio',
            'Avenida Las Palmeras',
            'Calle La Reforma',
            'Pasaje Los Laureles',
            'Avenida Roosevelt',
            'Calle Real'
        ];

        return [
            'colonia' => $this->faker->randomElement($colonias),
            'calle' => $this->faker->randomElement($calles),
            'numero_casa' => $this->faker->buildingNumber(),
            'punto_referencia' => $this->faker->optional(0.7)->sentence(6),
            'direccion_completa' => null,
            'distrito_id' => $distrito->id,
        ];
    }
}

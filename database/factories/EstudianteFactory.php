<?php

namespace Database\Factories;

use App\Models\Estudiante;
use App\Models\User;
use App\Models\Distrito;
use App\Models\NivelEducativo;
use App\Models\CentroEducativo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Estudiante>
 */
class EstudianteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Estudiante::class;

    public function definition()
    {
        // Asegura consistencia
        $centro = CentroEducativo::inRandomOrder()->first();
        $nivel = NivelEducativo::inRandomOrder()->first();
        $distrito = Distrito::inRandomOrder()->first();
        $usuario = User::factory()->create();
        $usuario->syncRoles(['estudiante']);
        return [
            'codigo'           => strtoupper(Str::random(8)),
            'user_id'          => $usuario->id,
            'primer_nombre'    => $this->faker->firstName,
            'segundo_nombre'   => $this->faker->firstName,
            'primer_apellido'  => $this->faker->lastName,
            'segundo_apellido' => $this->faker->lastName,
            'sexo'             => $this->faker->randomElement(['H', 'M']),
            'fecha_nacimiento' => $this->faker->date('Y-m-d', '-12 years'),
            'centro_educativo' => $centro->codigo,
            'nie'              => strtoupper(Str::random(10)),
            'telefono_casa'    => $this->faker->phoneNumber,
            'email'            => $this->faker->unique()->safeEmail,
            'direccion'        => $this->faker->address,
            'distrito'         => $distrito->id,
            'nivel_educativo'  => $nivel->codigo,
            'nivel'            => $nivel->nombre ?? 'media',
            'aprobado'         => $this->faker->boolean(70),
            'created_at'       => now(),
            'updated_at'       => now(),
        ];
    }
}

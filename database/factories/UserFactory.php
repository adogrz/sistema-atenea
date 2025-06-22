<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roles = ['director', 'admin', 'admin_academic', 'admin_academic_sede', 'coordinator_area', 'jefe_psicologia', 'psicologo', 'doctor_jefe', 'doctor', 'mentor', 'instructor', 'calificador', 'estudiante', 'aspirante'];
        $sedes = ['central', 'occidental', 'oriental'];

        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => Hash::make('password'), // Use a default password for all users
            'role_name' => $this->faker->randomElement($roles),
            'sede_name' => $this->faker->randomElement($sedes),
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}

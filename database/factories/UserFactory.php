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
     * Generates a default set of attributes for a User model instance with randomized values.
     *
     * Returns an array containing fake user data, including name, unique email, hashed password, randomly assigned role and location, status, a random remember token, and a null deleted_at field to simulate non-deleted users.
     *
     * @return array<string, mixed> The default attributes for a User model instance.
     */
    public function definition(): array
    {
        $roles = ['director', 'admin', 'admin_academic', 'admin_academic_sede', 'coordinator_area', 'jefe_psicologia', 'psicologo', 'doctor_jefe', 'doctor', 'mentor', 'instructor', 'calificador', 'estudiante', 'aspirante'];
        $sedes = ['central', 'occidental', 'oriental'];

        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'role_name' => $this->faker->randomElement($roles),
            'sede_name' => $this->faker->randomElement($sedes),
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'remember_token' => Str::random(10),
            'deleted_at' => null, //simular eliminados
        ];
    }

    /**
     * Sets the factory state to indicate the user's email is unverified.
     *
     * @return static The factory instance with the `email_verified_at` attribute set to null.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
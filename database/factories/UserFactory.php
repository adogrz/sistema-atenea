<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
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
        // Actualización de los nombres de roles para que coincidan con PermissionSeeder
        $roles = [
            'director',
            'admin-ti', // Antes era 'admin'
            'admin-academico', // Antes era 'admin_academic'
            'admin-academico-sede', // Antes era 'admin_academic_sede'
            'coordinador-area', // Antes era 'coordinator_area'
            'jefe-psicologia', // Antes era 'jefe_psicologia'
            'psicologo',
            'doctor-jefe', // Antes era 'doctor_jefe'
            'doctor',
            'mentor',
            'instructor',
            'calificador',
            'estudiante',
            'aspirante'
        ];

        $sedes = ['central', 'occidental', 'oriental'];

        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'sede_name' => $this->faker->randomElement($sedes),
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'remember_token' => Str::random(10),
            'deleted_at' => null, //simular eliminados
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}

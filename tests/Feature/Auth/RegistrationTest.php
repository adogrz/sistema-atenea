<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);
use App\Models\User;
use Spatie\Permission\Models\Role;
use App\Models\Sede;

test('registration screen can be rendered', function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrador']);
    Sede::create(['name' => 'central', 'description' => 'Sede Central']);

    $admin = User::factory()->create([
        'role_name' => 'admin',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrador']);
    Role::create(['name' => 'mentor', 'guard_name' => 'web', 'description' => 'Mentor']);
    Sede::create(['name' => 'central', 'description' => 'Sede Central']);

    $admin = User::factory()->create([
        'role_name' => 'admin',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role_name' => 'mentor',
        'sede_name' => 'central',
    ]);

    $this->assertAuthenticatedAs($admin);
    $response->assertRedirect(route('dashboard.usuarios', absolute: false));
});

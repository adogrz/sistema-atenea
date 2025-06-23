<?php

use App\Models\User;

use Spatie\Permission\Models\Role;
uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('admin users can authenticate using the login screen', function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrador']);

    $admin = User::factory()->create([
        'role_name' => 'admin',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('admin');

    $response = $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/login');
});


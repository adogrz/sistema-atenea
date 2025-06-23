<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated admin users can visit the dashboard', function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrador']);

    $admin = User::factory()->create([
        'role_name' => 'admin',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk();
});



<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('email verification screen can be rendered', function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrador']);
    $user = User::factory()->unverified()->create([
        'role_name' => 'admin',
    ]);
    $user->assignRole('admin');

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertStatus(200);
});

test('email can be verified', function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrador']);
    $user = User::factory()->unverified()->create([
        'role_name' => 'admin',
    ]);
    $user->assignRole('admin');

    Event::fake();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1($user->email)]
    );

    $response = $this->actingAs($user)->get($verificationUrl);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false).'?verified=1');
});

test('email is not verified with invalid hash', function () {
    Role::create(['name' => 'admin', 'guard_name' => 'web', 'description' => 'Administrador']);
    $user = User::factory()->unverified()->create([
        'role_name' => 'admin',
    ]);
    $user->assignRole('admin');

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(60),
        ['id' => $user->id, 'hash' => sha1('wrong-email')]
    );

    $this->actingAs($user)->get($verificationUrl);

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

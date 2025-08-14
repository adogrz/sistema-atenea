<?php

namespace Tests\Unit;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class HasTemporaryRolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_role_with_an_expiration_date_in_the_future_is_not_removed()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'test-role', 'description' => 'Test Role']);
        $user->roles()->attach($role->id, ['expires_at' => Carbon::now()->addDay()]);

        $user->clearExpiredRoles();

        $this->assertCount(1, $user->roles);
    }

    public function test_a_role_with_an_expiration_date_in_the_past_is_removed()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'test-role', 'description' => 'Test Role']);
        $user->roles()->attach($role->id, ['expires_at' => Carbon::now()->subDay()]);

        $user->clearExpiredRoles();

        $this->assertCount(0, $user->roles);
    }

    public function test_a_role_with_no_expiration_date_is_not_removed()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'test-role', 'description' => 'Test Role']);
        $user->roles()->attach($role->id, ['expires_at' => null]);

        $user->clearExpiredRoles();

        $this->assertCount(1, $user->roles);
    }

    public function test_the_primary_role_is_not_removed_even_if_it_has_an_expiration_date()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'test-role', 'description' => 'Test Role']);
        $user->roles()->attach($role->id, ['expires_at' => Carbon::now()->subDay(), 'is_primary' => true]);

        $user->clearExpiredRoles();

        $this->assertCount(1, $user->roles);
    }

    public function test_sync_roles_with_expiration()
    {
        $user = User::factory()->create();
        $role1 = Role::create(['name' => 'test-role-1', 'description' => 'Test Role 1']);
        $role2 = Role::create(['name' => 'test-role-2', 'description' => 'Test Role 2']);

        $roles = [
            ['name' => 'test-role-1', 'expires_at' => Carbon::now()->addDay()],
            ['name' => 'test-role-2', 'expires_at' => Carbon::now()->subDay()],
        ];

        $user->syncRolesWithExpiration($roles);

        $this->assertCount(2, $user->roles);

        $user->clearExpiredRoles();

        $this->assertCount(1, $user->roles);
        $this->assertEquals('test-role-1', $user->roles->first()->name);
    }
}

<?php

use App\Models\User;
use Database\Seeders\CategorySeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(CategorySeeder::class);
});

it('registers a new contractor', function () {
    $response = $this->postJson('/api/auth/register', [
        'first_name' => 'João',
        'last_name' => 'Silva',
        'email' => 'joao@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'role' => 'contractor',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['access_token', 'refresh_token', 'token_type', 'expires_in']);

    $this->assertDatabaseHas('users', ['email' => 'joao@example.com', 'role' => 'contractor']);
});

it('registers a new provider', function () {
    $response = $this->postJson('/api/auth/register', [
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'email' => 'maria@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'role' => 'provider',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['email' => 'maria@example.com', 'role' => 'provider']);
});

it('rejects duplicate email on register', function () {
    User::factory()->create(['email' => 'dup@example.com']);

    $this->postJson('/api/auth/register', [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'dup@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'role' => 'contractor',
    ])->assertStatus(422);
});

it('logs in with valid credentials', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('Password1!'),
    ]);

    $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'Password1!',
    ])->assertOk()
        ->assertJsonStructure(['access_token', 'refresh_token']);
});

it('rejects invalid credentials', function () {
    User::factory()->create(['email' => 'test@example.com']);

    $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ])->assertStatus(401);
});

it('returns authenticated user profile', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->getJson('/api/me')
        ->assertOk()
        ->assertJsonFragment(['email' => $user->email])
        ->assertJsonStructure(['uuid', 'first_name', 'last_name', 'email', 'role']);
});

it('lists active sessions', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'api')
        ->getJson('/api/auth/sessions')
        ->assertOk();
});

it('requires authentication for protected routes', function () {
    $this->getJson('/api/me')->assertStatus(401);
    $this->getJson('/api/contracts')->assertStatus(401);
    $this->getJson('/api/proposals/sent')->assertStatus(401);
});

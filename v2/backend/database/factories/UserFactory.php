<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'uuid' => Str::uuid(),
            'first_name' => fake('pt_BR')->firstName(),
            'last_name' => fake('pt_BR')->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'cpf' => fake('pt_BR')->cpf(false),
            'phone' => fake('pt_BR')->cellphoneNumber(false),
            'role' => 'contractor',
        ];
    }

    public function provider(): static
    {
        return $this->state(fn () => [
            'role' => 'provider',
            'stripe_onboarding_completed' => true,
            'stripe_account_id' => 'acct_' . Str::random(16),
        ]);
    }

    public function contractor(): static
    {
        return $this->state(fn () => ['role' => 'contractor']);
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }
}

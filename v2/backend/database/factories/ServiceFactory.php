<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uuid' => Str::uuid(),
            'user_id' => User::factory()->provider(),
            'category_id' => Category::factory(),
            'title' => fake('pt_BR')->sentence(4),
            'description' => fake('pt_BR')->paragraph(2),
            'base_price' => fake()->randomFloat(2, 50, 2000),
            'accepts_offer' => fake()->boolean(40),
            'is_community' => false,
            'status' => 'active',
        ];
    }

    public function community(): static
    {
        return $this->state(['is_community' => true, 'base_price' => null]);
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}

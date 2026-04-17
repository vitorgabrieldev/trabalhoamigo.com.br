<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake('pt_BR')->unique()->word();

        return [
            'uuid' => Str::uuid(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake('pt_BR')->sentence(),
            'order' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }
}

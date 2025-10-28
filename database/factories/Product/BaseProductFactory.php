<?php

namespace Database\Factories\Product;

use App\Models\Product\BaseProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

class BaseProductFactory extends Factory
{
    protected $model = BaseProduct::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'slug' => $this->faker->slug,
            'color' => $this->faker->hexColor,
            'sku' => $this->faker->unique()->word,
            'settings' => [
                'key1' => 'value1',
            ],
            'is_active' => true,
        ];
    }
}

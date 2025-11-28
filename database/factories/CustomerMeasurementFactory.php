<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer\CustomerMeasurement>
 */
class CustomerMeasurementFactory extends Factory
{
    protected $model = \App\Models\Customer\CustomerMeasurement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $weight = fake()->randomFloat(1, 50, 120);
        $height = fake()->randomFloat(1, 150, 200);

        return [
            'customer_id' => \App\Models\Customer\Customer::factory(),
            'measured_at' => fake()->dateTimeBetween('-1 year', 'now'),
            'weight' => $weight,
            'height' => $height,
            'chest_circumference' => fake()->randomFloat(1, 70, 120),
            'waist_circumference' => fake()->randomFloat(1, 60, 110),
            'hips_circumference' => fake()->randomFloat(1, 80, 130),
            'arm_circumference' => fake()->randomFloat(1, 25, 45),
            'thigh_circumference' => fake()->randomFloat(1, 40, 70),
            'body_fat_percentage' => fake()->randomFloat(1, 8, 35),
            'lean_mass_percentage' => fake()->randomFloat(1, 65, 92),
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
            'measured_by' => null, // Will be set by controller
        ];
    }
}

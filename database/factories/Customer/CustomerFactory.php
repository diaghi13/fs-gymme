<?php

namespace Database\Factories\Customer;

use App\Enums\GenderEnum;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // structure_id is auto-set by HasStructure trait from session
            // or can be explicitly provided when calling the factory
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'birth_date' => fake()->dateTimeBetween('-50 years', '-18 years'),
            'gender' => fake()->randomElement(GenderEnum::cases()),
            'birthplace' => fake()->city(),
            'tax_id_code' => fake()->unique()->regexify('[A-Z]{6}[0-9]{2}[A-Z][0-9]{3}'),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'street' => fake()->streetName(),
            'number' => fake()->buildingNumber(),
            'city' => fake()->city(),
            'zip' => fake()->postcode(),
            'province' => 'MI',
            'country' => 'IT',
        ];
    }
}

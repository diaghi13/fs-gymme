<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => fake()->phoneNumber(),
            'birth_date' => fake()->date(),
            'tax_code' => fake()->regexify('[A-Z]{6}[0-9]{2}[A-Z][0-9]{3}'),
            'is_active' => true,
            'gdpr_consent' => true,
            'gdpr_consent_at' => now(),
            'marketing_consent' => true,
            'marketing_consent_at' => now(),
            'data_retention_until' => now()->addYears(5),
            'fcm_token' => fake()->optional()->regexify('[A-Za-z0-9]{20}'),
            'app_version' => fake()->optional()->regexify('[0-9]+\.[0-9]+\.[0-9]+'),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}

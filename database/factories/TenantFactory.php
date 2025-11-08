<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tenant>
 */
class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'id' => Str::uuid()->toString(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::random(6),
            'vat_number' => fake()->numerify('###########'),
            'tax_code' => fake()->numerify('################'),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'country' => 'IT',
            'phone' => fake()->phoneNumber(),
            'email' => fake()->unique()->companyEmail(),
            'pec_email' => fake()->unique()->companyEmail(),
            'sdi_code' => Str::random(7),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the tenant is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the tenant has completed onboarding.
     */
    public function onboardingCompleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'onboarding_completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the tenant is in a trial period.
     */
    public function withTrial(int $days = 14): static
    {
        return $this->state(fn (array $attributes) => [
            'trial_ends_at' => now()->addDays($days),
        ]);
    }
}

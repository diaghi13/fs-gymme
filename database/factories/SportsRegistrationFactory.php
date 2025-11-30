<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer\SportsRegistration>
 */
class SportsRegistrationFactory extends Factory
{
    protected $model = \App\Models\Customer\SportsRegistration::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $organizations = [
            'ASI - Associazioni Sportive Sociali Italiane',
            'CONI - Comitato Olimpico Nazionale Italiano',
            'FIF - Federazione Italiana Fitness',
            'FIPE - Federazione Italiana Pesistica',
            'FIJLKAM - Federazione Italiana Judo Lotta Karate Arti Marziali',
            'FIT - Federazione Italiana Tennis',
            'FIN - Federazione Italiana Nuoto',
            'FGI - Federazione Ginnastica d\'Italia',
            'FIDAL - Federazione Italiana di Atletica Leggera',
            'FIGC - Federazione Italiana Giuoco Calcio',
        ];

        $startDate = fake()->dateTimeBetween('-2 years', 'now');
        $endDate = (clone $startDate)->modify('+1 year');

        return [
            'customer_id' => \App\Models\Customer\Customer::factory(),
            'organization' => fake()->randomElement($organizations),
            'membership_number' => fake()->boolean(70) ? strtoupper(fake()->bothify('??######')) : null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $endDate > now() ? 'active' : 'expired',
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }

    /**
     * Indicate that the registration is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => now()->subMonths(6),
            'end_date' => now()->addMonths(6),
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the registration is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => now()->subYears(2),
            'end_date' => now()->subYear(),
            'status' => 'expired',
        ]);
    }

    /**
     * Indicate that the registration is expiring soon.
     */
    public function expiringSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => now()->subMonths(11),
            'end_date' => now()->addDays(20),
            'status' => 'active',
        ]);
    }
}

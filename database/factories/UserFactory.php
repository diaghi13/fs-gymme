<?php

namespace Database\Factories;

use App\Models\CentralUser;
use App\Models\User;
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
            'password' => static::$password ??= 'password',
            'remember_token' => Str::random(10),
            'phone' => fake()->phoneNumber(),
            'birth_date' => fake()->date(),
            'tax_code' => fake()->regexify('[A-Z]{6}[0-9]{2}[A-Z][0-9]{3}[A-Z]'),
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

//    public function configure()
//    {
//        return $this->afterCreating(function (User $user) {
////            $tenant = tenancy()->find('test');
////
////            if ($tenant) {
////                $user->tenants()->attach($tenant);
////            }
//
//            tenancy()->central(function () use ($user) {
//                $centralUser = CentralUser::query()
//                    ->where('global_id', $user->global_id)
//                    ->first();
//
//                $centralUser->assignRole('customer');
//
//                //$user->tenants()->attach(tenancy()->find('test'));
//            });
//        });
//    }
}

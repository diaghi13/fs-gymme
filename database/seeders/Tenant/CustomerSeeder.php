<?php

namespace Database\Seeders\Tenant;

use App\Enums\GenderEnum;
use App\Models\Customer\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::factory()->count(50)->create();
        foreach ($users as $user) {
            Customer::query()->create([
                'structure_id' => fake()->randomElement([1, 2]),
                'user_id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'birth_date' => $user->birth_date,
                'gender' => fake()->randomElement(GenderEnum::class),
                'birthplace' => fake()->city(),
                'tax_id_code' => $user->tax_code,
                'email' => $user->email,
                'phone' => $user->phone,
                'street' => fake()->streetName(),
                'number' => fake()->buildingNumber(),
                'city' => fake()->city(),
                'zip' => fake()->postcode(),
                'province' => 'MI',
                'country' => 'IT',

                'gdpr_consent' => $user->gdpr_consent,
                'gdpr_consent_at' => $user->gdpr_consent_at,
                'marketing_consent' => $user->marketing_consent,
                'marketing_consent_at' => $user->marketing_consent_at,
                'data_retention_until' => $user->data_retention_until,
            ]);
        }

        // Assign roles to users
        tenancy()->central(function () use ($users) {
            foreach ($users as $user) {
                $centralUser = \App\Models\CentralUser::query()
                    ->where('global_id', $user->global_id)
                    ->first();

                if ($centralUser) {
                    $centralUser->assignRole('customer');
                }
            }
        });
    }
}

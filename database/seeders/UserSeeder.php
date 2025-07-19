<?php

namespace Database\Seeders;

use App\Models\CentralUser;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory(1)
            ->create()
            ->each(function ($user) {
                tenancy()->central(function () use ($user) {
                    $centralUser = CentralUser::query()
                        ->where('global_id', $user->global_id)
                        ->first();

                    $centralUser->assignRole('admin');
                    $centralUser->assignRole('manager');
                });
            });

        User::factory(2)
            ->create()
            ->each(function ($user) {
                tenancy()->central(function () use ($user) {
                    $centralUser = CentralUser::query()
                        ->where('global_id', $user->global_id)
                        ->first();

                    $centralUser->assignRole('customer');
                });
            });

        User::factory(2)
            ->create()
            ->each(function ($user) {
                tenancy()->central(function () use ($user) {
                    $centralUser = CentralUser::query()
                        ->where('global_id', $user->global_id)
                        ->first();

                    $centralUser->assignRole('staff');
                });
            });

        User::factory(5)
            ->create()
            ->each(function ($user) {
                tenancy()->central(function () use ($user) {
                    $centralUser = CentralUser::query()
                        ->where('global_id', $user->global_id)
                        ->first();

                    $centralUser->assignRole('instructor');
                });
            });
    }
}

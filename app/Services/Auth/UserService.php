<?php

namespace App\Services\Auth;

use App\Models\Structure;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = new User([
                'passwords' => Hash::make(Arr::get($data, 'user.password')),
                ...$data['user']]
            );

            $user->save();

            $company = new Tenant([
                ...$data['company'],
            ]);

            $company->save();

            $structure = new Structure([
                ...$data['structure'],
            ]);

            $structure->save();

            $user->refresh();

            return $user;
        });
    }
}

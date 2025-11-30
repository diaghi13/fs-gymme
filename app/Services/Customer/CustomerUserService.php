<?php

namespace App\Services\Customer;

use App\Models\CentralUser;
use App\Models\Customer\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CustomerUserService
{
    /**
     * Create or associate user account for customer
     * This is called when adding a new customer to give them mobile app access
     */
    public function createOrAssociateUserForCustomer(Customer $customer, ?string $email = null, ?string $password = null): User
    {
        return DB::transaction(function () use ($customer, $email, $password) {
            // Use customer email if not provided
            $email = $email ?? $customer->email;

            if (! $email) {
                throw new \Exception('Email is required to create user account for customer');
            }

            // Check if user exists in central DB
            $centralUser = CentralUser::where('email', $email)->first();

            if (! $centralUser) {
                // Create new user in central DB
                $centralUser = CentralUser::create([
                    'first_name' => $customer->first_name,
                    'last_name' => $customer->last_name,
                    'email' => $email,
                    'password' => Hash::make($password ?? \Str::random(16)),
                    'phone' => $customer->phone,
                    'birth_date' => $customer->birth_date,
                    'tax_code' => $customer->tax_code,
                ]);
            }

            // Sync to tenant DB
            $tenantUser = User::where('global_id', $centralUser->global_id)->first();

            if (! $tenantUser) {
                $tenantUser = User::create([
                    'global_id' => $centralUser->global_id,
                    'first_name' => $centralUser->first_name,
                    'last_name' => $centralUser->last_name,
                    'email' => $centralUser->email,
                    'password' => $centralUser->password,
                    'phone' => $centralUser->phone,
                    'birth_date' => $centralUser->birth_date,
                    'tax_code' => $centralUser->tax_code,
                ]);
            }

            // Assign customer role
            $customerRole = Role::findByName('customer', 'web');
            if (! $tenantUser->hasRole('customer')) {
                $tenantUser->assignRole($customerRole);
            }

            // Link user to customer
            $customer->update(['user_id' => $tenantUser->id]);

            return $tenantUser->fresh(['roles', 'permissions']);
        });
    }

    /**
     * Remove user account from customer (unlink only, don't delete user)
     */
    public function unlinkUserFromCustomer(Customer $customer): bool
    {
        if (! $customer->user_id) {
            return true;
        }

        return DB::transaction(function () use ($customer) {
            $user = $customer->user;

            if ($user) {
                // Remove customer role only for this tenant
                $user->removeRole('customer');
            }

            // Unlink user from customer
            $customer->update(['user_id' => null]);

            return true;
        });
    }

    /**
     * Check if customer has user account
     */
    public function hasUserAccount(Customer $customer): bool
    {
        return ! is_null($customer->user_id);
    }

    /**
     * Get customer's user account
     */
    public function getUserAccount(Customer $customer): ?User
    {
        return $customer->user;
    }
}

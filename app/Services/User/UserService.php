<?php

namespace App\Services\User;

use App\Models\CentralUser;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserService
{
    /**
     * Invite a new user to the tenant
     * Creates user in central DB if not exists, syncs to tenant DB, assigns role
     */
    public function inviteUser(array $data, string $roleName): User
    {
        return DB::transaction(function () use ($data, $roleName) {
            // Check if user exists in central DB
            $centralUser = CentralUser::where('email', $data['email'])->first();

            if (! $centralUser) {
                // Create new user in central DB
                $centralUser = CentralUser::create([
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password'] ?? \Str::random(16)),
                ]);
            }

            // Sync to tenant DB (will create or update)
            $tenantUser = User::where('global_id', $centralUser->global_id)->first();

            if (! $tenantUser) {
                $tenantUser = User::create([
                    'global_id' => $centralUser->global_id,
                    'first_name' => $centralUser->first_name,
                    'last_name' => $centralUser->last_name,
                    'email' => $centralUser->email,
                    'password' => $centralUser->password,
                ]);
            }

            // Assign role
            $role = Role::findByName($roleName, 'web');
            $tenantUser->assignRole($role);

            return $tenantUser->fresh(['roles', 'permissions']);
        });
    }

    /**
     * Update user information
     */
    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            // Update tenant user
            $user->update($data);

            // Sync to central if needed
            if ($user->getCentralModelName()) {
                $centralUser = CentralUser::where('global_id', $user->global_id)->first();
                if ($centralUser) {
                    $syncableFields = array_intersect_key($data, array_flip($user->getSyncedAttributeNames()));
                    if (! empty($syncableFields)) {
                        $centralUser->update($syncableFields);
                    }
                }
            }

            return $user->fresh();
        });
    }

    /**
     * Assign role to user
     */
    public function assignRole(User $user, string $roleName): User
    {
        $role = Role::findByName($roleName, 'web');
        $user->syncRoles([$role]);

        return $user->fresh(['roles', 'permissions']);
    }

    /**
     * Assign permissions to user (in addition to role permissions)
     */
    public function assignPermissions(User $user, array $permissions): User
    {
        $user->syncPermissions($permissions);

        return $user->fresh(['roles', 'permissions']);
    }

    /**
     * Remove user from tenant (soft delete or remove role)
     */
    public function removeUserFromTenant(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            // Remove all roles and permissions
            $user->syncRoles([]);
            $user->syncPermissions([]);

            // Mark as inactive
            $user->update(['is_active' => false]);

            return true;
        });
    }

    /**
     * Get all users with specific role
     */
    public function getUsersByRole(string $roleName)
    {
        return User::role($roleName)
            ->where('is_active', true)
            ->with(['roles', 'permissions'])
            ->get();
    }

    /**
     * Get all trainers
     */
    public function getTrainers()
    {
        return $this->getUsersByRole('trainer');
    }

    /**
     * Check if user can be assigned a role
     */
    public function canAssignRole(User $actor, string $roleName): bool
    {
        // Owner can assign any role
        if ($actor->isOwner()) {
            return true;
        }

        // Manager can assign any role except owner
        if ($actor->isManager() && $roleName !== 'owner') {
            return true;
        }

        return false;
    }
}

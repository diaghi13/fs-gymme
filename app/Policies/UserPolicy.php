<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Can view if has permission
        if ($user->can('users.view')) {
            return true;
        }

        // Can view self
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can invite/create users.
     */
    public function create(User $user): bool
    {
        return $user->can('users.invite');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Cannot modify owner unless you are owner
        if ($model->isOwner() && ! $user->isOwner()) {
            return false;
        }

        // Can update if has permission
        if ($user->can('users.manage')) {
            return true;
        }

        // Can update self (limited fields)
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Cannot delete self
        if ($user->id === $model->id) {
            return false;
        }

        // Cannot delete owner unless you are owner
        if ($model->isOwner() && ! $user->isOwner()) {
            return false;
        }

        return $user->can('users.delete');
    }

    /**
     * Determine whether the user can assign roles to users.
     */
    public function assignRole(User $user, User $model, string $roleName): bool
    {
        // Owner can assign any role
        if ($user->isOwner()) {
            return true;
        }

        // Manager can assign any role except owner
        if ($user->isManager() && $roleName !== 'owner') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can manage permissions.
     */
    public function managePermissions(User $user): bool
    {
        return $user->isOwner() || $user->isManager();
    }
}

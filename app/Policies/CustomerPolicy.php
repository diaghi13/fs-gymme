<?php

namespace App\Policies;

use App\Models\Customer\Customer;
use App\Models\User;
use App\Services\User\TrainerAssignmentService;

class CustomerPolicy
{
    public function __construct(
        public TrainerAssignmentService $trainerService
    ) {}

    /**
     * Determine whether the user can view any customers.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('customers.view_all') || $user->can('customers.view_assigned');
    }

    /**
     * Determine whether the user can view the customer.
     */
    public function view(User $user, Customer $customer): bool
    {
        // Can view all customers
        if ($user->can('customers.view_all')) {
            return true;
        }

        // Trainer can view only assigned customers
        if ($user->isTrainer() && $user->can('customers.view_assigned')) {
            return $this->trainerService->isTrainerAssignedToCustomer($user, $customer);
        }

        // Customer can view self
        if ($user->customer && $user->customer->id === $customer->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create customers.
     */
    public function create(User $user): bool
    {
        return $user->can('customers.create');
    }

    /**
     * Determine whether the user can update the customer.
     */
    public function update(User $user, Customer $customer): bool
    {
        // Can edit all customers
        if ($user->can('customers.edit')) {
            return true;
        }

        // Trainer can edit only assigned customers (limited fields)
        if ($user->isTrainer() && $user->can('customers.view_assigned')) {
            return $this->trainerService->isTrainerAssignedToCustomer($user, $customer);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the customer.
     */
    public function delete(User $user, Customer $customer): bool
    {
        return $user->can('customers.delete');
    }

    /**
     * Determine whether the user can view financial data.
     */
    public function viewFinancial(User $user, Customer $customer): bool
    {
        return $user->can('customers.view_financial');
    }

    /**
     * Determine whether the user can assign trainers to customer.
     */
    public function assignTrainer(User $user, Customer $customer): bool
    {
        return $user->can('training.manage') || $user->can('customers.edit');
    }
}

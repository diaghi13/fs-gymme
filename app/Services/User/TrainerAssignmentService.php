<?php

namespace App\Services\User;

use App\Models\Customer\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TrainerAssignmentService
{
    /**
     * Assign trainer to customer
     */
    public function assignTrainer(Customer $customer, User $trainer, ?string $notes = null): bool
    {
        // Verify user is actually a trainer
        if (! $trainer->isTrainer()) {
            throw new \Exception('User must have trainer role to be assigned to customers');
        }

        return DB::transaction(function () use ($customer, $trainer, $notes) {
            // Check if already assigned
            $existing = $customer->trainers()
                ->withoutGlobalScopes()
                ->wherePivot('trainer_id', $trainer->id)
                ->first();

            if ($existing) {
                // Reactivate if exists
                DB::table('customer_trainer')
                    ->where('customer_id', $customer->id)
                    ->where('trainer_id', $trainer->id)
                    ->update([
                        'is_active' => true,
                        'assigned_at' => now(),
                        'notes' => $notes,
                        'updated_at' => now(),
                    ]);
            } else {
                // Create new assignment
                $customer->trainers()->attach($trainer->id, [
                    'assigned_at' => now(),
                    'is_active' => true,
                    'notes' => $notes,
                ]);
            }

            return true;
        });
    }

    /**
     * Remove trainer from customer
     */
    public function removeTrainer(Customer $customer, User $trainer): bool
    {
        return DB::transaction(function () use ($customer, $trainer) {
            // Mark as inactive instead of deleting
            DB::table('customer_trainer')
                ->where('customer_id', $customer->id)
                ->where('trainer_id', $trainer->id)
                ->update([
                    'is_active' => false,
                    'updated_at' => now(),
                ]);

            return true;
        });
    }

    /**
     * Get all customers assigned to trainer
     */
    public function getAssignedCustomers(User $trainer)
    {
        if (! $trainer->isTrainer()) {
            return collect();
        }

        return $trainer->assigned_customers()
            ->with(['active_subscriptions', 'trainers'])
            ->get();
    }

    /**
     * Get all trainers assigned to customer
     */
    public function getAssignedTrainers(Customer $customer)
    {
        return $customer->trainers()
            ->with(['roles', 'permissions'])
            ->get();
    }

    /**
     * Check if trainer is assigned to customer
     */
    public function isTrainerAssignedToCustomer(User $trainer, Customer $customer): bool
    {
        return $customer->trainers()
            ->where('trainer_id', $trainer->id)
            ->exists();
    }

    /**
     * Update assignment notes
     */
    public function updateAssignmentNotes(Customer $customer, User $trainer, string $notes): bool
    {
        return DB::table('customer_trainer')
            ->where('customer_id', $customer->id)
            ->where('trainer_id', $trainer->id)
            ->update([
                'notes' => $notes,
                'updated_at' => now(),
            ]) > 0;
    }

    /**
     * Get assignment details
     */
    public function getAssignmentDetails(Customer $customer, User $trainer): ?array
    {
        $assignment = DB::table('customer_trainer')
            ->where('customer_id', $customer->id)
            ->where('trainer_id', $trainer->id)
            ->first();

        if (! $assignment) {
            return null;
        }

        return [
            'assigned_at' => $assignment->assigned_at,
            'is_active' => $assignment->is_active,
            'notes' => $assignment->notes,
        ];
    }
}

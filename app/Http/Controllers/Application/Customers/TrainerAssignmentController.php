<?php

namespace App\Http\Controllers\Application\Customers;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use App\Models\User;
use App\Services\User\TrainerAssignmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainerAssignmentController extends Controller
{
    public function __construct(
        public TrainerAssignmentService $trainerService
    ) {}

    /**
     * Assign trainer to customer
     */
    public function store(Request $request, Customer $customer): RedirectResponse
    {
        $this->authorize('assignTrainer', $customer);

        $validated = $request->validate([
            'trainer_id' => ['required', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $trainer = User::findOrFail($validated['trainer_id']);

        try {
            $this->trainerService->assignTrainer(
                $customer,
                $trainer,
                $validated['notes'] ?? null
            );

            return back()->with('success', 'Trainer assigned successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['trainer_id' => $e->getMessage()]);
        }
    }

    /**
     * Update assignment notes
     */
    public function update(Request $request, Customer $customer, User $trainer): RedirectResponse
    {
        $this->authorize('assignTrainer', $customer);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $this->trainerService->updateAssignmentNotes(
            $customer,
            $trainer,
            $validated['notes'] ?? ''
        );

        return back()->with('success', 'Assignment notes updated successfully.');
    }

    /**
     * Remove trainer from customer
     */
    public function destroy(Customer $customer, User $trainer): RedirectResponse
    {
        $this->authorize('assignTrainer', $customer);

        $this->trainerService->removeTrainer($customer, $trainer);

        return back()->with('success', 'Trainer removed successfully.');
    }
}

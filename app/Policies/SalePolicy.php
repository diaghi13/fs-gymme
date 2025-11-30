<?php

namespace App\Policies;

use App\Models\Sale\Sale;
use App\Models\User;

class SalePolicy
{
    /**
     * Determine whether the user can view any sales.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('sales.view');
    }

    /**
     * Determine whether the user can view the sale.
     */
    public function view(User $user, Sale $sale): bool
    {
        return $user->can('sales.view');
    }

    /**
     * Determine whether the user can create sales.
     */
    public function create(User $user): bool
    {
        return $user->can('sales.create');
    }

    /**
     * Determine whether the user can update the sale.
     */
    public function update(User $user, Sale $sale): bool
    {
        // Cannot edit if electronic invoice is sent
        if ($sale->electronic_invoice && $sale->electronic_invoice->status === 'sent') {
            return false;
        }

        return $user->can('sales.edit');
    }

    /**
     * Determine whether the user can delete the sale.
     */
    public function delete(User $user, Sale $sale): bool
    {
        // Cannot delete if electronic invoice is sent or accepted
        if ($sale->electronic_invoice && in_array($sale->electronic_invoice->status, ['sent', 'accepted'])) {
            return false;
        }

        return $user->can('sales.delete');
    }

    /**
     * Determine whether the user can view profit data.
     */
    public function viewProfits(User $user, Sale $sale): bool
    {
        return $user->can('sales.view_profits');
    }

    /**
     * Determine whether the user can create credit notes.
     */
    public function createCreditNote(User $user, Sale $sale): bool
    {
        // Must have create permission
        if (! $user->can('sales.create')) {
            return false;
        }

        // Can only create credit note for invoices (not credit notes)
        if ($sale->type === 'credit_note') {
            return false;
        }

        // Electronic invoice must be accepted
        if ($sale->electronic_invoice && $sale->electronic_invoice->status !== 'accepted') {
            return false;
        }

        return true;
    }
}

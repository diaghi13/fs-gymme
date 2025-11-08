<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class OnboardingController extends Controller
{
    /**
     * Mark onboarding as completed for current tenant.
     */
    public function complete(): RedirectResponse
    {
        $tenant = tenant();

        if (! $tenant) {
            return back()->withErrors(['error' => 'Tenant non trovato']);
        }

        if ($tenant->hasCompletedOnboarding()) {
            return back()->with('info', 'Onboarding già completato');
        }

        $tenant->completeOnboarding();

        Log::info('Tenant onboarding completed', [
            'tenant_id' => $tenant->id,
            'tenant_name' => $tenant->name,
        ]);

        return back()->with('success', 'Benvenuto! Inizia ad esplorare la piattaforma.');
    }
}

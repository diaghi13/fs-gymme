<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\TenantRegistrationRequest;
use App\Models\Tenant;
use App\Services\Tenant\TenantProvisioningService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TenantRegistrationController extends Controller
{
    public function __construct(
        protected TenantProvisioningService $provisioningService
    ) {}

    /**
     * Show the tenant registration form.
     */
    public function create(): Response
    {
        $isDemo = request()->query('demo', false);

        return Inertia::render('central/tenant-registration', [
            'trialDays' => config('app.trial_days', 14),
            'isDemo' => filter_var($isDemo, FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    /**
     * Handle the tenant registration request.
     */
    public function store(TenantRegistrationRequest $request): RedirectResponse
    {
        try {
            // Validate data with the service
            $this->provisioningService->validateProvisioningData($request->validated());

            // Check if this is a demo registration
            $isDemo = $request->input('is_demo', false);

            // Provision the tenant
            $tenant = $this->provisioningService->provision($request->validated(), $isDemo);

            // Get the central user
            $centralUser = $tenant->owner;

            if ($centralUser) {
                // Fire registered event
                event(new Registered($centralUser));

                // Send welcome notification
                $loginUrl = route('central.redirectToApp', ['tenant' => $tenant->id]);
                $centralUser->notify(new \App\Notifications\Tenant\WelcomeNotification($tenant, $loginUrl));

                // Log in the user
                Auth::login($centralUser);

                Log::info('New tenant registered successfully', [
                    'tenant_id' => $tenant->id,
                    'tenant_name' => $tenant->name,
                    'user_email' => $centralUser->email,
                ]);

                // Redirect to the tenant's application
                return redirect()->route('central.redirectToApp', ['tenant' => $tenant->id])
                    ->with('success', 'Registrazione completata! Benvenuto su '.$tenant->name.'. Ti abbiamo inviato una email di conferma.');
            }

            // Fallback if owner not found (shouldn't happen)
            return redirect()->route('home')
                ->with('error', 'Registrazione completata ma impossibile accedere automaticamente.');
        } catch (\InvalidArgumentException $e) {
            Log::warning('Tenant registration validation failed', [
                'error' => $e->getMessage(),
                'data' => $request->except(['user.password', 'user.password_confirmation']),
            ]);

            return back()
                ->withInput($request->except(['user.password', 'user.password_confirmation']))
                ->withErrors(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            Log::error('Tenant registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->except(['user.password', 'user.password_confirmation']),
            ]);

            return back()
                ->withInput($request->except(['user.password', 'user.password_confirmation']))
                ->withErrors(['error' => 'Si è verificato un errore durante la registrazione. Riprova più tardi.']);
        }
    }

    /**
     * Check if a tenant email is available.
     */
    public function checkEmail(string $email): \Illuminate\Http\JsonResponse
    {
        $exists = Tenant::where('email', $email)->exists();

        return response()->json([
            'available' => ! $exists,
        ]);
    }

    /**
     * Check if a tenant slug is available.
     */
    public function checkSlug(string $slug): \Illuminate\Http\JsonResponse
    {
        $exists = Tenant::where('slug', $slug)->exists();

        return response()->json([
            'available' => ! $exists,
        ]);
    }
}

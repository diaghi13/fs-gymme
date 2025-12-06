<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\TenantRegistrationRequest;
use App\Models\CentralUser;
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
     * Show the simplified demo registration form.
     */
    public function createDemo(): Response
    {
        return Inertia::render('central/demo-registration', [
            'trialDays' => config('demo.duration_days', 14),
        ]);
    }

    /**
     * Handle the tenant registration request.
     */
    public function store(TenantRegistrationRequest $request): RedirectResponse
    {
        // try {
        // Validate data with the service
        $this->provisioningService->validateProvisioningData($request->validated());

        // Check if this is a demo registration
        $isDemo = $request->input('is_demo', false);

        // Provision the tenant
        $tenant = $this->provisioningService->provision($request->validated(), $isDemo);

        // Get the central user directly (not via $tenant->owner relation)
        // The attach happens in InitializeTenantData after DB creation
        $centralUser = CentralUser::query()->where('email', $request->input('user.email'))->first();

        if ($centralUser) {
            // Log in the user FIRST (before any redirects)
            // This ensures the session is available for auth middleware on provisioning page
            Auth::login($centralUser, true);

            // Fire registered event
            event(new Registered($centralUser));

            // Send welcome notification
            $loginUrl = route('central.redirectToApp', ['tenant' => $tenant->id]);
            $centralUser->notify(new \App\Notifications\Tenant\WelcomeNotification($tenant, $loginUrl));

            Log::info('New tenant registered successfully', [
                'tenant_id' => $tenant->id,
                'tenant_name' => $tenant->name,
                'user_email' => $centralUser->email,
                'is_demo' => $isDemo,
            ]);

            // Redirect based on registration type
            if ($isDemo) {
                // Refresh tenant to get latest provisioning status
                $tenant->refresh();

                Log::info('Checking provisioning status', [
                    'tenant_id' => $tenant->id,
                    'provisioning_status' => $tenant->provisioning_status ?? 'null',
                    'data' => $tenant->data,
                    'isProvisioningComplete' => $tenant->isProvisioningComplete(),
                ]);

                // Demo: check if provisioning is complete (sync vs async)
                if ($tenant->isProvisioningComplete()) {
                    // Sync: tenant ready immediately
                    return redirect()->route('central.app.redirect', ['tenant' => $tenant->id])
                        ->with('success', 'Demo attivata! Benvenuto su '.$tenant->name.'. Puoi esplorare tutte le funzionalità con dati di esempio.');
                } else {
                    // Async: show provisioning page
                    return redirect()->route('central.tenant.provisioning', ['tenant' => $tenant->id])
                        ->with('info', 'Stiamo preparando il tuo ambiente demo. Attendere prego...');
                }
            } else {
                // Paid: redirect to subscription plans for payment
                // Tenant provisioning happens async, user selects plan first
                return redirect()->route('app.subscription-plans.index', ['tenant' => $tenant->id])
                    ->with('success', 'Registrazione completata! Scegli il piano di abbonamento per attivare il tuo account.');
            }
        }

        // Fallback if owner not found (shouldn't happen)
        return redirect()->route('home')
            ->with('error', 'Registrazione completata ma impossibile accedere automaticamente.');
        //        } catch (\InvalidArgumentException $e) {
        //            Log::warning('Tenant registration validation failed', [
        //                'error' => $e->getMessage(),
        //                'data' => $request->except(['user.password', 'user.password_confirmation']),
        //            ]);
        //
        //            return back()
        //                ->withInput($request->except(['user.password', 'user.password_confirmation']))
        //                ->withErrors(['error' => $e->getMessage()]);
        //        } catch (\Exception $e) {
        //            Log::error('Tenant registration failed', [
        //                'error' => $e->getMessage(),
        //                'trace' => $e->getTraceAsString(),
        //                'data' => $request->except(['user.password', 'user.password_confirmation']),
        //            ]);
        //
        //            return back()
        //                ->withInput($request->except(['user.password', 'user.password_confirmation']))
        //                ->withErrors(['error' => 'Si è verificato un errore durante la registrazione. Riprova più tardi.']);
        //        }
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

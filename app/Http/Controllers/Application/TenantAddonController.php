<?php

namespace App\Http\Controllers\Application;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\Controller;
use App\Models\PlanFeature;
use App\Models\Tenant;
use App\Models\TenantAddon;
use App\Services\Features\FeatureAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller for managing tenant addons (feature purchases).
 *
 * Allows tenants to:
 * - View available addons for their current plan
 * - Purchase new addons
 * - Upgrade existing addon quotas
 * - Cancel addons
 */
class TenantAddonController extends Controller
{
    public function __construct(
        protected FeatureAccessService $featureAccess
    ) {}

    /**
     * Display available addons for current tenant.
     */
    public function index(Request $request): Response
    {
        $tenant = Tenant::find(session('current_tenant_id'));

        if (! $tenant || ! $tenant->hasActiveSubscriptionPlan()) {
            return Inertia::render('subscription/addons', [
                'error' => 'Nessun piano attivo. Attiva un abbonamento per acquistare addons.',
                'availableAddons' => [],
                'currentAddons' => [],
            ]);
        }

        $currentPlan = $tenant->active_subscription_plan;

        // Get all available features that can be purchased as addons (from central DB)
        $availableFeatures = tenancy()->central(function () {
            return PlanFeature::active()
                ->addonPurchasable()
                ->get();
        });

        $availableAddons = [];
        foreach ($availableFeatures as $feature) {
            // Check if already included in plan
            $includedInPlan = $currentPlan->features()
                ->where('plan_feature_id', $feature->id)
                ->wherePivot('is_included', true)
                ->exists();

            // Check if already purchased as addon
            $existingAddon = $tenant->activeAddons()
                ->where('plan_feature_id', $feature->id)
                ->first();

            // Get plan configuration for this feature (if any)
            $planFeature = $currentPlan->features()
                ->where('plan_feature_id', $feature->id)
                ->first();

            $availableAddons[] = [
                'id' => $feature->id,
                'name' => $feature->name,
                'display_name' => $feature->display_name,
                'description' => $feature->description,
                'feature_type' => $feature->feature_type->value,
                'included_in_plan' => $includedInPlan,
                'plan_quota' => $planFeature?->pivot->quota_limit,
                'addon_price' => $planFeature?->pivot->price ?? $feature->default_addon_price,
                'addon_quota' => $feature->default_addon_quota,
                'has_active_addon' => $existingAddon !== null,
                'current_addon' => $existingAddon ? [
                    'id' => $existingAddon->id,
                    'quota_limit' => $existingAddon->quota_limit,
                    'price_cents' => $existingAddon->price_cents,
                    'starts_at' => $existingAddon->starts_at,
                    'ends_at' => $existingAddon->ends_at,
                ] : null,
                'current_usage' => $this->featureAccess->getUsage($tenant, $feature->name),
            ];
        }

        // Get all currently active addons
        $currentAddons = $tenant->activeAddons()
            ->with('feature')
            ->get()
            ->map(function ($addon) use ($tenant) {
                return [
                    'id' => $addon->id,
                    'feature_name' => $addon->feature->display_name,
                    'quota_limit' => $addon->quota_limit,
                    'price_cents' => $addon->price_cents,
                    'starts_at' => $addon->starts_at,
                    'ends_at' => $addon->ends_at,
                    'current_usage' => $this->featureAccess->getUsage($tenant, $addon->feature->name),
                    'is_unlimited' => $addon->quota_limit === null,
                ];
            });

        return Inertia::render('subscription/addons', [
            'currentPlan' => [
                'id' => $currentPlan->id,
                'name' => $currentPlan->name,
                'tier' => $currentPlan->tier?->value,
            ],
            'availableAddons' => $availableAddons,
            'currentAddons' => $currentAddons,
        ]);
    }

    /**
     * Purchase a new addon.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'feature_id' => 'required|exists:plan_features,id',
            'payment_method' => 'nullable|string|in:stripe,bank_transfer,manual',
        ]);

        $tenant = Tenant::find(session('current_tenant_id'));

        if (! $tenant || ! $tenant->hasActiveSubscriptionPlan()) {
            return redirect()->back()->with('error', 'Nessun piano attivo.');
        }

        $feature = tenancy()->central(function () use ($validated) {
            return PlanFeature::findOrFail($validated['feature_id']);
        });

        // Check if feature is purchasable
        if (! $feature->is_addon_purchasable) {
            return redirect()->back()->with('error', 'Questa feature non può essere acquistata come addon.');
        }

        // Check if already included in plan
        $includedInPlan = $tenant->active_subscription_plan->features()
            ->where('plan_feature_id', $feature->id)
            ->wherePivot('is_included', true)
            ->exists();

        if ($includedInPlan) {
            return redirect()->back()->with('error', 'Questa feature è già inclusa nel tuo piano.');
        }

        // Check if already purchased
        $existingAddon = $tenant->activeAddons()
            ->where('plan_feature_id', $feature->id)
            ->first();

        if ($existingAddon) {
            return redirect()->back()->with('error', 'Hai già acquistato questo addon.');
        }

        DB::beginTransaction();

        try {
            // Get pricing from plan or default
            $planFeature = $tenant->active_subscription_plan->features()
                ->where('plan_feature_id', $feature->id)
                ->first();

            $price = $planFeature?->pivot->price ?? $feature->default_addon_price;
            $quota = $feature->default_addon_quota;

            $paymentMethod = $validated['payment_method'] ?? 'stripe';

            // Create addon
            $addon = TenantAddon::create([
                'tenant_id' => $tenant->id,
                'plan_feature_id' => $feature->id,
                'quota_limit' => $quota,
                'price_cents' => $price,
                'payment_method' => $paymentMethod,
                'status' => $paymentMethod === 'stripe' ? SubscriptionStatus::Active->value : SubscriptionStatus::PendingPayment->value,
                'is_active' => $paymentMethod === 'stripe', // Active immediately for Stripe
                'starts_at' => now(),
            ]);

            // TODO: Create Stripe subscription item if payment method is stripe
            // TODO: Send bank transfer instructions email if payment method is bank_transfer

            DB::commit();

            Log::info('Addon purchased', [
                'tenant_id' => $tenant->id,
                'addon_id' => $addon->id,
                'feature' => $feature->name,
                'payment_method' => $paymentMethod,
            ]);

            if ($paymentMethod === 'bank_transfer') {
                return redirect()->back()->with('success', 'Addon acquistato. Riceverai le istruzioni per il bonifico via email.');
            }

            return redirect()->back()->with('success', 'Addon acquistato con successo!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to purchase addon', [
                'tenant_id' => $tenant->id,
                'feature_id' => $feature->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Errore durante l\'acquisto dell\'addon.');
        }
    }

    /**
     * Cancel an addon.
     */
    public function destroy(Request $request, int $addonId): RedirectResponse
    {
        $tenant = Tenant::find(session('current_tenant_id'));

        $addon = TenantAddon::where('tenant_id', $tenant->id)
            ->where('id', $addonId)
            ->firstOrFail();

        DB::beginTransaction();

        try {
            $addon->cancel();

            // TODO: Cancel Stripe subscription item if exists

            DB::commit();

            Log::info('Addon cancelled', [
                'tenant_id' => $tenant->id,
                'addon_id' => $addon->id,
            ]);

            return redirect()->back()->with('success', 'Addon cancellato con successo.');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to cancel addon', [
                'tenant_id' => $tenant->id,
                'addon_id' => $addonId,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Errore durante la cancellazione dell\'addon.');
        }
    }

    /**
     * Upgrade addon quota.
     */
    public function upgrade(Request $request, int $addonId): RedirectResponse
    {
        $validated = $request->validate([
            'new_quota' => 'required|integer|min:1',
        ]);

        $tenant = Tenant::find(session('current_tenant_id'));

        $addon = TenantAddon::where('tenant_id', $tenant->id)
            ->where('id', $addonId)
            ->firstOrFail();

        if (! $addon->isActive()) {
            return redirect()->back()->with('error', 'Questo addon non è attivo.');
        }

        DB::beginTransaction();

        try {
            $oldQuota = $addon->quota_limit;
            $newQuota = $validated['new_quota'];

            // Calculate price difference
            // TODO: Implement proper pricing calculation based on quota increase

            $addon->update([
                'quota_limit' => $newQuota,
            ]);

            // TODO: Update Stripe subscription item quantity if exists

            DB::commit();

            Log::info('Addon upgraded', [
                'tenant_id' => $tenant->id,
                'addon_id' => $addon->id,
                'old_quota' => $oldQuota,
                'new_quota' => $newQuota,
            ]);

            return redirect()->back()->with('success', 'Quota addon aumentata con successo!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to upgrade addon', [
                'tenant_id' => $tenant->id,
                'addon_id' => $addonId,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Errore durante l\'upgrade dell\'addon.');
        }
    }
}

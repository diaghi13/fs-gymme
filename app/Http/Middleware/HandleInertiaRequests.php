<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Map subscription to active features based on subscription plan
     * Subscription plans and features are stored in central database
     */
    protected function getSubscriptionFeatures($subscription): array
    {
        return tenancy()->central(function () use ($subscription) {
            // Get the subscription plan from Stripe price ID
            $subscriptionPlan = \App\Models\SubscriptionPlan::where('stripe_price_id', $subscription->stripe_price)->first();

            if (! $subscriptionPlan) {
                return [];
            }

            // Get all features included in this plan
            $features = $subscriptionPlan->features()
                ->wherePivot('is_included', true)
                ->get()
                ->pluck('name')
                ->toArray();

            return $features;
        });
    }

    /**
     * Get all available features (for demo tenants)
     * Features are stored in central database
     */
    protected function getAllFeatures(): array
    {
        return tenancy()->central(function () {
            return \App\Models\PlanFeature::where('is_active', true)
                ->pluck('name')
                ->toArray();
        });
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? function () use ($request) {
                    // If tenancy is initialized, get user from tenant database
                    // Otherwise, use the central database user
                    $user = $request->user();

                    if (tenancy()->initialized && $user->global_id) {
                        // Get the synced user from tenant database
                        $tenantUser = \App\Models\User::where('global_id', $user->global_id)->first();
                        if ($tenantUser) {
                            $user = $tenantUser;
                        }
                    }

                    $userData = [
                        'id' => $user->id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'roles' => $user->roles()->pluck('name')->toArray(),
                        'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                        // DEBUG: check tenancy and connection
                        '_debug' => [
                            'tenancy_initialized' => tenancy()->initialized,
                            'tenant_id' => tenancy()->tenant ? tenancy()->tenant->id : null,
                            'user_connection' => $user->getConnectionName(),
                            'global_id' => $user->global_id ?? null,
                        ],
                    ];

                    // Add tenants only if this is a CentralUser (not in tenant context)
                    if ($user instanceof \App\Models\CentralUser) {
                        $userData['tenants'] = $user->tenants()->select(['tenants.id', 'tenants.name'])->get()->toArray();
                    }

                    return $userData;
                } : null,
            ],
            // TEMPORARY: Testing if Ziggy is causing 502 errors
            // 'ziggy' => fn (): array => [
            //     ...(new Ziggy)->toArray(),
            //     'location' => $request->url(),
            // ],
            'ziggy' => fn (): array => [
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'message' => fn () => $request->session()->get('message'),
            ],
            'currentTenantId' => $request->route()->originalParameter('tenant') ?: $request->session()->get('current_tenant_id'),
            'csrf_token' => fn () => csrf_token(),
            'tenant' => function () {
                // Only load tenant if tenancy is initialized
                if (! tenancy()->initialized) {
                    return null;
                }

                if (! tenancy()->tenant) {
                    return null;
                }

                $tenant = tenancy()->tenant;

                // Get active subscription plan and features
                $subscriptionPlan = null;
                $activeFeatures = [];
                $isDemo = $tenant->is_demo;

                // Demo tenants get ALL features to encourage upgrade
                if ($isDemo) {
                    $activeFeatures = $this->getAllFeatures();
                    $subscriptionPlan = [
                        'name' => 'demo',
                        'status' => 'active',
                        'is_demo' => true,
                        'demo_expires_at' => $tenant->demo_expires_at?->toISOString(),
                        'demo_remaining_days' => $tenant->demoRemainingDays(),
                    ];
                } elseif ($tenant->subscribed('default')) {
                    $subscription = $tenant->subscription('default');
                    $subscriptionPlan = [
                        'name' => $subscription->stripe_price,
                        'status' => $subscription->stripe_status,
                        'is_demo' => false,
                    ];

                    // Get features based on subscription plan
                    $activeFeatures = $this->getSubscriptionFeatures($subscription);
                }

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'is_demo' => $isDemo,
                    'onboarding_completed_at' => $tenant->onboarding_completed_at?->toISOString(),
                    'trial_ends_at' => $tenant->trial_ends_at?->toISOString(),
                    'subscription_plan' => $subscriptionPlan,
                    'active_features' => $activeFeatures,
                ];
            },
            'structures' => function () use ($request) {
                // Only load structures if we're in a tenant context
                if (! tenancy()->initialized || ! Auth::check()) {
                    return null;
                }

                $structures = \App\Models\Structure::withoutGlobalScopes()
                    ->select(['id', 'name', 'street', 'number', 'city', 'zip_code', 'province', 'country'])
                    ->orderBy('name')
                    ->get()
                    ->map(function ($structure) {
                        $addressParts = array_filter([
                            $structure->street,
                            $structure->number,
                            $structure->city,
                        ]);
                        $structure->address = implode(', ', $addressParts);

                        return $structure->only(['id', 'name', 'address']);
                    });

                return [
                    'list' => $structures,
                    'current_id' => $request->cookie('current_structure_id') ? (int) $request->cookie('current_structure_id') : null,
                ];
            },
            'regional_settings' => function () {
                // Only load regional settings if tenancy is initialized
                if (! tenancy()->initialized) {
                    return null;
                }

                return [
                    'language' => \App\Models\TenantSetting::get('regional.language', 'it'),
                    'timezone' => \App\Models\TenantSetting::get('regional.timezone', 'Europe/Rome'),
                    'date_format' => \App\Models\TenantSetting::get('regional.date_format', 'd/m/Y'),
                    'time_format' => \App\Models\TenantSetting::get('regional.time_format', 'H:i'),
                    'currency' => \App\Models\TenantSetting::get('regional.currency', 'EUR'),
                    'decimal_separator' => \App\Models\TenantSetting::get('regional.decimal_separator', ','),
                    'thousands_separator' => \App\Models\TenantSetting::get('regional.thousands_separator', '.'),
                ];
            },
        ];
    }
}

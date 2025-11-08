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

        //        if (Auth::check()) {
        //            $request->user()->load([
        //                'tenants',
        //                'roles.permissions',
        //                'permissions',
        //            ]);
        //        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
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

                return tenancy()->tenant ? [
                    'id' => tenancy()->tenant->id,
                    'name' => tenancy()->tenant->name,
                    'onboarding_completed_at' => tenancy()->tenant->onboarding_completed_at?->toISOString(),
                    'trial_ends_at' => tenancy()->tenant->trial_ends_at?->toISOString(),
                ] : null;
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
        ];
    }
}

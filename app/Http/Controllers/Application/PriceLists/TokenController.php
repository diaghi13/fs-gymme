<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\Token;
use App\Services\PriceList\SubscriptionPriceListService;
use App\Support\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TokenController extends Controller
{
    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('price-lists/price-lists', [
            ...SubscriptionPriceListService::getViewAttributes(),
            'priceList' => new Token([
                'color' => Color::randomHex(),
                'token_quantity' => 10,
                'validity_days' => 365,
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:price_lists,id',
            'color' => 'required|string|max:7',
            'price' => 'required|numeric|min:0',
            'vat_rate_id' => 'required|exists:vat_rates,id',
            'token_quantity' => 'required|integer|min:1',
            'validity_days' => 'nullable|integer|min:1',
            'saleable' => 'nullable|boolean',
            'saleable_from' => 'nullable|date',
            'saleable_to' => 'nullable|date|after:saleable_from',

            // Settings
            'applicable_products' => 'nullable|array',
            'applicable_products.*' => 'exists:products,id',
            'all_products' => 'nullable|boolean',
        ]);

        // Auto-inherit booking rules from BookableService(s) if applicable
        $bookingDefaults = $this->extractBookingDefaultsFromProducts($data['applicable_products'] ?? []);

        // Build settings with inherited defaults
        $settings = [
            'usage' => [
                'applicable_to' => $data['applicable_products'] ?? [],
                'all_products' => $data['all_products'] ?? false,
                'requires_booking' => ! empty($data['applicable_products']),
                'auto_deduct' => true,
            ],
            'booking' => $bookingDefaults, // Copy defaults into DB for easy access
            'validity' => [
                'starts_on_purchase' => true,
                'starts_on_first_use' => false,
                'expires_if_unused' => true,
            ],
            'restrictions' => [
                'max_per_day' => null,
                'blackout_dates' => [],
                'transferable' => false,
            ],
        ];

        $token = Token::create([
            ...$request->only(['name', 'parent_id', 'color', 'price', 'vat_rate_id', 'token_quantity', 'validity_days', 'saleable', 'saleable_from', 'saleable_to']),
            'settings' => $settings,
        ]);

        return to_route('app.price-lists.tokens.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'token' => $token->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Extract booking defaults from BookableService products
     * Returns a definitive copy of the rules to store in DB
     */
    private function extractBookingDefaultsFromProducts(array $productIds): array
    {
        if (empty($productIds)) {
            return [
                'advance_booking_days' => null,
                'cancellation_hours' => null,
                'max_bookings_per_day' => null,
            ];
        }

        // Find the first BookableService in the list
        $bookableService = \App\Models\Product\BookableService::whereIn('id', $productIds)->first();

        if (! $bookableService || ! $bookableService->settings) {
            return [
                'advance_booking_days' => null,
                'cancellation_hours' => null,
                'max_bookings_per_day' => null,
            ];
        }

        // Extract and COPY the booking rules into the Token
        $bookingSettings = $bookableService->settings['booking'] ?? [];

        return [
            'advance_booking_days' => $bookingSettings['advance_days'] ?? null,
            'cancellation_hours' => $bookingSettings['cancellation_hours'] ?? null,
            'max_bookings_per_day' => $bookingSettings['max_per_day'] ?? null,
        ];
    }

    /**
     * Display the specified resource.
     */
    public function show(Token $token)
    {
        $token->load('vat_rate');

        // Initialize settings if null
        if (is_null($token->settings)) {
            $token->settings = $token->getTypeSpecificSettingsDefaults();
            $token->save();
        }

        return Inertia::render('price-lists/price-lists', [
            ...SubscriptionPriceListService::getViewAttributes(),
            'priceList' => $token,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Token $token)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|exists:price_lists,id',
            'color' => 'sometimes|required|string|max:7',
            'price' => 'sometimes|required|numeric|min:0',
            'vat_rate_id' => 'sometimes|required|exists:vat_rates,id',
            'token_quantity' => 'sometimes|required|integer|min:1',
            'validity_days' => 'nullable|integer|min:1',
            'saleable' => 'nullable|boolean',
            'saleable_from' => 'nullable|date',
            'saleable_to' => 'nullable|date|after:saleable_from',

            // Settings - can be sent directly from tabs
            'settings' => 'nullable|array',
            'settings.usage' => 'nullable|array',
            'settings.booking' => 'nullable|array',
            'settings.booking.advance_booking_days' => 'nullable|integer|min:0|max:365',
            'settings.booking.cancellation_hours' => 'nullable|integer|min:0|max:168',
            'settings.booking.max_bookings_per_day' => 'nullable|integer|min:1|max:50',
            'settings.validity' => 'nullable|array',
            'settings.validity.starts_on_purchase' => 'nullable|boolean',
            'settings.validity.starts_on_first_use' => 'nullable|boolean',
            'settings.validity.expires_if_unused' => 'nullable|boolean',
            'settings.restrictions' => 'nullable|array',
            'settings.restrictions.max_per_day' => 'nullable|integer|min:1|max:100',
            'settings.restrictions.transferable' => 'nullable|boolean',

            // Or individual fields from GeneralTab
            'applicable_products' => 'nullable|array',
            'applicable_products.*' => 'exists:products,id',
            'all_products' => 'nullable|boolean',
        ]);

        // Check if settings are sent directly (from BookingTab)
        if (isset($data['settings'])) {
            // Direct settings update
            $token->update([
                'settings' => $data['settings'],
            ]);
        } else {
            // Update from GeneralTab - preserve and merge settings
            $settings = $token->settings ?? $token->getTypeSpecificSettingsDefaults();

            // Only update usage if applicable_products or all_products are present
            if (isset($data['applicable_products']) || isset($data['all_products'])) {
                $settings['usage'] = [
                    'applicable_to' => $data['applicable_products'] ?? [],
                    'all_products' => $data['all_products'] ?? false,
                    'requires_booking' => ! empty($data['applicable_products']),
                    'auto_deduct' => $settings['usage']['auto_deduct'] ?? true,
                ];
            }

            $token->update([
                ...$request->only(['name', 'parent_id', 'color', 'price', 'vat_rate_id', 'token_quantity', 'validity_days', 'saleable', 'saleable_from', 'saleable_to']),
                'settings' => $settings,
            ]);
        }

        return to_route('app.price-lists.tokens.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'token' => $token->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Duplicate the specified resource.
     */
    public function duplicate(Token $token)
    {
        $newToken = $token->replicate();
        $newToken->name = 'Copia di '.$token->name;
        $newToken->settings = $token->settings;
        $newToken->save();

        return to_route('app.price-lists.tokens.show', [
            'tenant' => session()->get('current_tenant_id'),
            'token' => $newToken->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Token $token)
    {
        $token->delete();

        return to_route('app.price-lists.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}

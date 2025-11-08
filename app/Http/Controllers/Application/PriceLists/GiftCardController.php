<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\GiftCard;
use App\Services\PriceList\PriceListService;
use App\Support\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GiftCardController extends Controller
{
    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => new GiftCard([
                'color' => Color::randomHex(),
                'validity_months' => 12,
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id'],
            'color' => ['required', 'string', 'max:7'],
            'price' => ['required', 'numeric', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
            'validity_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        $giftCard = GiftCard::create($validated);

        return to_route('app.price-lists.gift-cards.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'gift_card' => $giftCard->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(GiftCard $giftCard)
    {
        $giftCard->load('vat_rate');

        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => $giftCard,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GiftCard $giftCard)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id', function ($attribute, $value, $fail) use ($giftCard) {
                if ($value === $giftCard->id) {
                    $fail('Non puoi selezionare se stesso come parent.');
                }
            }],
            'color' => ['required', 'string', 'max:7'],
            'price' => ['required', 'numeric', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
            'validity_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        $giftCard->update($validated);

        return to_route('app.price-lists.gift-cards.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'gift_card' => $giftCard->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Duplicate the specified resource.
     */
    public function duplicate(GiftCard $giftCard)
    {
        $newGiftCard = $giftCard->replicate();
        $newGiftCard->name = 'Copia di '.$giftCard->name;
        $newGiftCard->save();

        return to_route('app.price-lists.gift-cards.show', [
            'tenant' => session()->get('current_tenant_id'),
            'gift_card' => $newGiftCard->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GiftCard $giftCard)
    {
        $giftCard->delete();

        return to_route('app.price-lists.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}

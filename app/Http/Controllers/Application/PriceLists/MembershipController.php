<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\Membership;
use App\Services\PriceList\PriceListService;
use App\Support\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipController extends Controller
{
    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        $membership = new Membership([
            'color' => Color::randomHex(),
            'months_duration' => 12,
        ]);
        $membership->type = 'membership';

        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => $membership,
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
            'months_duration' => ['required', 'integer', 'min:1', 'max:120'],
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        // Convert empty string to null for parent_id (foreign key constraint)
        if (isset($validated['parent_id']) && $validated['parent_id'] === '') {
            $validated['parent_id'] = null;
        }

        $membership = Membership::create($validated);

        return to_route('app.price-lists.memberships.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'membership' => $membership->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(Membership $membership)
    {
        $membership->load('vat_rate');

        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => $membership,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Membership $membership)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id', function ($attribute, $value, $fail) use ($membership) {
                if ($value === $membership->id) {
                    $fail('Non puoi selezionare se stesso come parent.');
                }
            }],
            'color' => ['required', 'string', 'max:7'],
            'price' => ['required', 'numeric', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
            'months_duration' => ['required', 'integer', 'min:1', 'max:120'],
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        // Convert empty string to null for parent_id (foreign key constraint)
        if (isset($validated['parent_id']) && $validated['parent_id'] === '') {
            $validated['parent_id'] = null;
        }

        $membership->update($validated);

        return to_route('app.price-lists.memberships.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'membership' => $membership->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Duplicate the specified resource.
     */
    public function duplicate(Membership $membership)
    {
        $newMembership = $membership->replicate();
        $newMembership->name = 'Copia di '.$membership->name;
        $newMembership->save();

        return to_route('app.price-lists.memberships.show', [
            'tenant' => session()->get('current_tenant_id'),
            'membership' => $newMembership->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Membership $membership)
    {
        $membership->delete();

        return to_route('app.price-lists.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}

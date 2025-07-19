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
        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => new Membership([
                'color' => Color::randomHex(),
                'months_duration' => 12,
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $membership = Membership::create($request->only(['name', 'parent_id', 'color', 'vat_rate_id', 'saleable']));

        return to_route('app.price-lists.memberships.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'membership' => $membership->id
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
        $membership->update($request->only(['name', 'parent_id', 'color', 'vat_rate_id', 'saleable']));

        return to_route('app.price-lists.memberships.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'membership' => $membership->id
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

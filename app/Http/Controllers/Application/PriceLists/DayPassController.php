<?php

namespace App\Http\Controllers\Application\PriceLists;

use App\Http\Controllers\Controller;
use App\Models\PriceList\DayPass;
use App\Services\PriceList\PriceListService;
use App\Support\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DayPassController extends Controller
{
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => new DayPass([
                'color' => Color::randomHex(),
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
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        $dayPass = DayPass::create($validated);

        return to_route('app.price-lists.day-passes.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'day_pass' => $dayPass->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(DayPass $dayPass)
    {
        $dayPass->load('vat_rate');

        return Inertia::render('price-lists/price-lists', [
            ...PriceListService::getViewAttributes(),
            'priceList' => $dayPass,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DayPass $dayPass)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:price_lists,id', function ($attribute, $value, $fail) use ($dayPass) {
                if ($value === $dayPass->id) {
                    $fail('Non puoi selezionare se stesso come parent.');
                }
            }],
            'color' => ['required', 'string', 'max:7'],
            'price' => ['required', 'numeric', 'min:0'],
            'vat_rate_id' => ['required', 'integer', 'exists:vat_rates,id'],
            'saleable' => ['nullable', 'boolean'],
            'saleable_from' => ['nullable', 'date'],
            'saleable_to' => ['nullable', 'date', 'after_or_equal:saleable_from'],
        ]);

        $dayPass->update($validated);

        return to_route('app.price-lists.day-passes.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'day_pass' => $dayPass->id,
        ])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DayPass $dayPass)
    {
        $dayPass->delete();

        return to_route('app.price-lists.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}

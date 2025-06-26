<?php

namespace App\Http\Controllers\App\PriceLists;

use App\Contracts\PriceListContract;
use App\Http\Controllers\Controller;
use App\Models\PriceList\PriceList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PriceListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('price-lists/price-lists', [
            'priceLists' => (new PriceList())->tree()
                ->orderByRaw('color IS NULL DESC')
                ->orderBy('name')
                ->get()
                ->toTree()
        ]);
    }

    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(PriceListContract $priceList)
    {
        //
    }

    /**
     * CustomerShow the form for editing the specified resource.
     */
    public function edit(PriceListContract $priceList)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PriceListContract $priceList)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PriceListContract $priceList)
    {
        //
    }
}

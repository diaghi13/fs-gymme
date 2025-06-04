<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\BaseProductStoreRequest;
use App\Models\Product\BaseProduct;
use App\Models\Product\Product;
use App\Services\Product\BaseProductService;
use App\Support\Color;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BaseProductController extends Controller
{
    protected $products;

    public function __construct()
    {
        $this->products = BaseProduct::all(['id', 'name', 'color']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('products/base-products', [
            'products' => $this->products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('products/base-products', [
            'products' => $this->products,
            'product' => new Product([
                'name' => '',
                'color' => Color::randomHex(),
                'visible' => true,
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BaseProductStoreRequest $request, BaseProductService $service)
    {
        $product = $service->store($request->validated());

        return to_route('base-products.show', ['base_product' => $product->id])
            ->with('status', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(BaseProduct $baseProduct, BaseProductService $service)
    {
        ['product' => $product, 'vatRateOptions' => $vatRates,] = $service->show($baseProduct);

        return Inertia::render('products/base-products', [
            'products' => $this->products,
            'product' => $product,
            'vatRateOptions' => $vatRates,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BaseProduct $baseProduct)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'visible' => 'required|boolean',
        ]);

        $baseProduct->update($validatedData);

        return to_route('base-products.show', ['base_product' => $baseProduct->id])
            ->with('status', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BaseProduct $baseProduct, BaseProductService $service)
    {
        $service->delete($baseProduct);

        return to_route('base-products.index')
            ->with('status', 'success');
    }
}

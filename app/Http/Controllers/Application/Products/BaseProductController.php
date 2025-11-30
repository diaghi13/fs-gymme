<?php

namespace App\Http\Controllers\Application\Products;

use App\Dtos\Product\BaseProductDto;
use App\Http\Controllers\Controller;
use App\Http\Requests\Products\BaseProductStoreRequest;
use App\Models\Product\BaseProduct;
use App\Services\Product\BaseProductService;
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
     * CustomerShow the form for creating a new resource.
     */
    public function create(Request $request, BaseProductService $service)
    {
        return Inertia::render('products/base-products', [
            'products' => $this->products,
            'product' => $service->newProduct(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BaseProductStoreRequest $request, BaseProductService $service)
    {
        try {
            $product = $service->store($request->validated());

            return to_route('app.base-products.show', [
                'tenant' => $request->session()->get('current_tenant_id'),
                'base_product' => $product->id
            ])
                ->with('status', 'success');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Failed to create the product.')
                ->withErrors(['error' => 'Failed to create the product: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(BaseProduct $baseProduct, BaseProductService $service)
    {
        return Inertia::render('products/base-products', [
            ...$service->show($baseProduct),
            'products' => $this->products,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BaseProductDto $dto, BaseProductService $service)
    {
        try {
            $product = $service->update($dto);

            // redirect with the correct tab
            return to_route('app.base-products.show', [
                'tenant' => $request->session()->get('current_tenant_id'),
                'base_product' => $product->id,
                'tab' => $request->input('tab', 1),
            ])->with('status', 'success');
        } catch (\Throwable $e) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Failed to create the product.')
                ->withErrors(['error' => 'Failed to update the product: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, BaseProductService $service)
    {
        $service->delete($id);

        return to_route('app.base-products.index', [
            'tenant' => session()->get('current_tenant_id'),
        ])
            ->with('status', 'success');
    }
}

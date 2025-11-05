<?php

namespace App\Http\Controllers\Application\Products;

use App\Dtos\Product\CourseProductDto;
use App\Http\Controllers\Controller;
use App\Models\Product\CourseProduct;
use App\Services\Product\CourseProductService;
use Illuminate\Http\Request;

class CourseProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia('products/course-products', [
            'products' => CourseProduct::all(['id', 'name', 'color']),
        ]);
    }

    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create(CourseProductService $service)
    {
        return inertia('products/course-products', [
            'products' => CourseProduct::all(),
            'product' => $service->newProduct(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @throws \Throwable
     */
    public function store(Request $request, CourseProductDto $dto, CourseProductService $service)
    {
        try {
            $product = $service->store($dto);

            return to_route('app.course-products.show', [
                'tenant' => $request->session()->get('current_tenant_id'),
                'course_product' => $product->id,
            ])
                ->with('status', 'success')
                ->with('message', 'Product created successfully');
        } catch (\Throwable $exception) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Failed to create the product.')
                ->withErrors(['error' => 'Failed to create the product: '.$exception->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CourseProduct $courseProduct, CourseProductService $service)
    {
        return inertia('products/course-products', [
            'products' => CourseProduct::all(['id', 'name', 'color']),
            ...$service->show($courseProduct),
        ]);
    }

    /**
     * CustomerShow the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CourseProductDto $dto, CourseProductService $service)
    {
        try {
            $product = $service->update($dto);

            return to_route('app.course-products.show', [
                'tenant' => $request->session()->get('current_tenant_id'),
                'course_product' => $product->id,
                'tab' => $request->get('tab', '1'),
            ])
                ->with('status', 'success')
                ->with('message', 'Product updated successfully');
        } catch (\Throwable $exception) {
            return back()
                ->with('status', 'error')
                ->with('message', 'Failed to update the product.')
                ->withErrors(['error' => 'Failed to update the product: '.$exception->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, CourseProductService $service)
    {
        $service->delete($id);

        return to_route('app.course-products.index', [
            'tenant' => session('current_tenant_id'),
        ])
            ->with('status', 'success')
            ->with('message', 'Product deleted successfully');
    }
}

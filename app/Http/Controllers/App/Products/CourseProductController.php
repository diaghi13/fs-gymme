<?php

namespace App\Http\Controllers\App\Products;

use App\Http\Controllers\Controller;
use App\Models\VatRate;
use Illuminate\Http\Request;

class CourseProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return inertia("products/course-products", [
            "products" => \App\Models\Product\CourseProduct::all(['id', 'name', 'color']),
        ]);
    }

    /**
     * CustomerShow the form for creating a new resource.
     */
    public function create()
    {
        return inertia("products/course-products", [
            "products" => \App\Models\Product\CourseProduct::all(),
            "product" => new \App\Models\Product\CourseProduct([
                "name" => "",
                "color" => '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT),
                //"type" => BaseProduct::BASE_PRODUCT,
                "visible" => true
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $product = \App\Models\Product\CourseProduct::create($request->validate([
            "name" => "required|string|max:255",
            "color" => "required|string|max:7",
            "visible" => "boolean",
        ]));

        return to_route("course-products.show", ["course_product" => $product->id])
            ->with('message', 'success');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = \App\Models\Product\CourseProduct::with(['planning', 'plannings'])->findOrFail($id);

        $plannings = $product->plannings();

        return inertia("products/course-products", [
            "products" => \App\Models\Product\CourseProduct::all(['id', 'name', 'color']),
            "product" => $product,
            "vatRateOptions" => $vatRates = VatRate::query()
                ->get()
                ->map(function ($vatRate) {
                    return [
                        'value' => $vatRate->id,
                        'label' => $vatRate->code . ' - ' . $vatRate->description,
                    ];
                }),
            'planningOptions' => []
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
    public function update(Request $request, string $id)
    {
        $product = \App\Models\Product\CourseProduct::findOrFail($id);

        $product->update($request->validate([
            "name" => "required|string|max:255",
            "color" => "required|string|max:7",
            "visible" => "boolean",
        ]));

        return to_route("course-products.show", ["course_product" => $product->id])
            ->with('message', 'success');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = \App\Models\Product\CourseProduct::findOrFail($id);

        $product->delete();

        return to_route("course-products.index")
            ->with('message', 'success');
    }
}

<?php

namespace App\Http\Controllers\Application\Products;

use App\Http\Controllers\Controller;
use App\Models\Product\CourseProduct;
use App\Models\VatRate;
use Illuminate\Http\Request;

class CourseProductSaleUpdate extends Controller
{
    public function __invoke(Request $request, CourseProduct $product)
    {
        $product->update([
            'sale_in_subscription' => $request->input('sale_in_subscription'),
            'selling_description' => $request->input('selling_description'),
        ]);

        if ($request->input('vat_rate')) {
            $vatRate = VatRate::find($request->input('vat_rate')['value']);

            $product->vat_rate()->associate($vatRate);

        } else {
            $product->vat_rate()->dissociate();

        }

        $product->save();

        return to_route('app.course-products.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'course_product' => $product->id,
            'tab' => 4
        ])
            ->with('status', 'success');
    }
}

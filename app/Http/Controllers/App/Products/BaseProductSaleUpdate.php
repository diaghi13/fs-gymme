<?php

namespace App\Http\Controllers\App\Products;

use App\Http\Controllers\Controller;
use App\Models\Product\BaseProduct;
use App\Models\VatRate;
use Illuminate\Http\Request;

class BaseProductSaleUpdate extends Controller
{
    public function __invoke(Request $request, BaseProduct $product)
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

        return redirect(route('base-products.show', ['base_product' => $product->id]) . '?tab=3')
            ->with('status', 'success');
    }
}

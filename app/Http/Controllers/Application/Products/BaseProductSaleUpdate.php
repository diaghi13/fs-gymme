<?php

namespace App\Http\Controllers\Application\Products;

use App\Http\Controllers\Controller;
use App\Models\Product\BaseProduct;
use App\Models\VatRate;
use Illuminate\Http\Request;

/**
 * Handle sale configuration updates for Base Products
 *
 * This controller manages sale-related settings that serve as templates/defaults
 * when creating PriceLists, NOT the actual commercial pricing.
 */
class BaseProductSaleUpdate extends Controller
{
    public function __invoke(Request $request, BaseProduct $product)
    {
        $validated = $request->validate([
            'saleable_in_subscription' => 'boolean',
            'selling_description' => 'nullable|string',
            'vat_rate' => 'nullable|array',
            'vat_rate.value' => 'nullable|exists:vat_rates,id',
        ]);

        $product->update([
            'saleable_in_subscription' => $validated['saleable_in_subscription'] ?? $product->saleable_in_subscription,
            'selling_description' => $validated['selling_description'] ?? $product->selling_description,
        ]);

        // Update VAT rate association
        if (isset($validated['vat_rate']['value'])) {
            $vatRate = VatRate::find($validated['vat_rate']['value']);
            $product->vat_rate()->associate($vatRate);
        } else {
            $product->vat_rate()->dissociate();
        }

        $product->save();

        return to_route('app.base-products.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'base_product' => $product->id,
            'tab' => 3,
        ])
            ->with('status', 'success')
            ->with('message', 'Configurazione vendita aggiornata con successo');
    }
}

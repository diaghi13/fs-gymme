<?php

namespace App\Http\Controllers\Application\Products;

use App\Http\Controllers\Controller;
use App\Models\Product\BookableService;
use App\Models\VatRate;
use Illuminate\Http\Request;

/**
 * Handle sale configuration updates for Bookable Services
 *
 * This controller manages sale-related settings that serve as templates/defaults
 * when creating PriceLists, NOT the actual commercial pricing.
 */
class BookableServiceSaleUpdate extends Controller
{
    public function __invoke(Request $request, BookableService $bookableService)
    {
        $validated = $request->validate([
            'saleable_in_subscription' => 'boolean',
            'selling_description' => 'nullable|string',
            'vat_rate' => 'nullable|array',
            'vat_rate.value' => 'nullable|exists:vat_rates,id',
        ]);

        $bookableService->update([
            'saleable_in_subscription' => $validated['saleable_in_subscription'] ?? $bookableService->saleable_in_subscription,
            'selling_description' => $validated['selling_description'] ?? $bookableService->selling_description,
        ]);

        // Update VAT rate association
        if (isset($validated['vat_rate']['value'])) {
            $vatRate = VatRate::find($validated['vat_rate']['value']);
            $bookableService->vat_rate()->associate($vatRate);
        } else {
            $bookableService->vat_rate()->dissociate();
        }

        $bookableService->save();

        return to_route('app.bookable-services.show', [
            'tenant' => $request->session()->get('current_tenant_id'),
            'bookable_service' => $bookableService->id,
            'tab' => 4,
        ])
            ->with('status', 'success')
            ->with('message', 'Configurazione vendita aggiornata con successo');
    }
}

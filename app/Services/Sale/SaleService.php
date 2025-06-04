<?php

namespace App\Services\Sale;

use App\Models\Sale\Sale;
use App\Models\Support\DocumentTypeElectronicInvoice;
use App\Services\PriceList\PriceListService;
use Illuminate\Support\Str;

class SaleService
{
    public function create($customerId = null)
    {
        $progressiveNumber = Sale::query()
            ->where('year', now()->year)
            ->exists() ? Sale::query()
                ->where('year', now()->year)
                ->max('progressive_number') + 1 : 1;

        $progressiveNumber = Str::padLeft($progressiveNumber, 4, 0);

        $sale = new Sale([
            'date' => now(),
            'year' => now()->year,
            'progressive_number' => $progressiveNumber,
            'document_type_id' => DocumentTypeElectronicInvoice::query()->where('code', 'TD01')->first()?->id ?? null,
        ]);

        if ($customerId && $customer = \App\Models\Customer\Customer::find($customerId)) {
            $sale->customer_id = $customer->id;
            $sale->customer = $customer->append(['full_name', 'option_label']);
        }

        return [
            'sale' => $sale,
            'customers' => \App\Models\Customer\Customer::all()->append('option_label')->toArray(),
            'documentTypeElectronicInvoices' => DocumentTypeElectronicInvoice::all()->append('label')->toArray(),
            'paymentConditions' => \App\Models\Support\PaymentCondition::with(['installments', 'payment_method'])->get()->toArray(),
            'paymentMethods' => \App\Models\Support\PaymentMethod::all()->append('label')->toArray(),
            'financialResources' => \App\Models\Support\FinancialResource::with('financial_resource_type')->get()->toArray(),
            'promotions' => \App\Models\Sale\Promotion::all()->toArray(),
            'priceLists' => PriceListService::toTree()->toArray(),
        ];
    }
}

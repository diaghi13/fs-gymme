<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Enums\SaleStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Services\Sale\ElectronicInvoiceService;
use Illuminate\Http\RedirectResponse;

class GenerateController extends Controller
{
    public function __invoke(Sale $sale, ElectronicInvoiceService $service): RedirectResponse
    {
        // Validate sale is not draft or canceled
        if (in_array($sale->status, [SaleStatusEnum::DRAFT->value, SaleStatusEnum::CANCELED->value])) {
            return redirect()->back()->withErrors([
                'sale' => 'La vendita deve essere salvata o inviata prima di generare la fattura elettronica',
            ]);
        }

        // Check if already generated
        if ($sale->electronic_invoice) {
            return redirect()->back()->withErrors([
                'sale' => 'Fattura elettronica già generata per questa vendita',
            ]);
        }

        try {
            $electronicInvoice = $service->generateXml($sale);

            return redirect()->back()->with('success',
                "Fattura elettronica generata con successo. Transmission ID: {$electronicInvoice->transmission_id}"
            );
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'generation' => $e->getMessage(),
            ]);
        }
    }
}

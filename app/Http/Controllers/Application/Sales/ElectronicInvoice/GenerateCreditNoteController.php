<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Services\Sale\ElectronicInvoiceService;
use Illuminate\Http\RedirectResponse;

class GenerateCreditNoteController extends Controller
{
    /**
     * Generate electronic credit note (TD04) for a sale
     */
    public function __invoke(Sale $sale, ElectronicInvoiceService $service): RedirectResponse
    {
        // Validate sale can have a credit note
        if (! $sale->electronic_invoice) {
            return redirect()->back()->withErrors([
                'credit_note' => 'Non puoi creare una nota di credito per una vendita senza fattura elettronica',
            ]);
        }

        if ($sale->electronic_invoice->sdi_status !== 'accepted') {
            return redirect()->back()->withErrors([
                'credit_note' => 'Puoi creare una nota di credito solo per fatture accettate dal SDI',
            ]);
        }

        try {
            // Generate XML with TD04 (Credit Note)
            $electronicInvoice = $service->generateXml($sale, 'TD04');

            return redirect()->back()->with('success',
                "Nota di credito generata con successo. Transmission ID: {$electronicInvoice->transmission_id}"
            );
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'generation' => $e->getMessage(),
            ]);
        }
    }
}

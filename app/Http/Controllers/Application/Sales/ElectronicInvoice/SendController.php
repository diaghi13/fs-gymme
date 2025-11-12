<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Services\Sale\FatturaElettronicaApiService;
use Illuminate\Http\RedirectResponse;

class SendController extends Controller
{
    public function __invoke(Sale $sale, FatturaElettronicaApiService $service): RedirectResponse
    {
        if (! $sale->electronic_invoice) {
            return redirect()->back()->withErrors([
                'invoice' => 'Genera prima la fattura elettronica',
            ]);
        }

        if (! $sale->electronic_invoice->canSend()) {
            return redirect()->back()->withErrors([
                'invoice' => 'La fattura non può essere inviata nello stato attuale',
            ]);
        }

        $result = $service->send($sale->electronic_invoice);

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->withErrors([
            'send' => $result['message'],
        ]);
    }
}

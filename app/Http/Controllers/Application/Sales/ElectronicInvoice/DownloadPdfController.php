<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use Barryvdh\DomPDF\Facade\Pdf;

class DownloadPdfController extends Controller
{
    /**
     * Download PDF rappresentazione tabellare della fattura elettronica
     */
    public function __invoke(Sale $sale)
    {
        // Verifica che esista una fattura elettronica
        if (! $sale->electronic_invoice) {
            abort(404, 'Fattura elettronica non trovata');
        }

        // Eager load relazioni necessarie per il PDF
        $sale->load([
            'customer',
            'rows.vat_rate',
            'electronic_invoice',
            'document_type',
            'payments' => [
                'payment_method',
            ],
            'payment_condition',
            'financial_resource',
            'structure',
        ]);

        // Verifica customer
        if (! $sale->customer) {
            abort(404, 'Cliente non trovato per questa vendita');
        }

        // Get tenant data
        $tenant = tenant();

        if (! $tenant) {
            abort(500, 'Tenant non trovato');
        }

        try {
            //            return view('pdf.electronic-invoice', [
            //                'sale' => $sale,
            //                'tenant' => $tenant,
            //            ]);
            // Generate PDF from Blade template
            $pdf = Pdf::loadView('pdf.electronic-invoice', [
                'sale' => $sale,
                'tenant' => $tenant,
            ]);

            // Set PDF options
            $pdf->setPaper('a4', 'portrait');
            $pdf->setOption('defaultFont', 'DejaVu Sans');

            // Generate filename
            $filename = sprintf(
                'Fattura_%s_%s.pdf',
                str_replace('/', '_', $sale->progressive_number),
                $sale->date->format('Y-m-d')
            );

            // Return PDF as download
            return $pdf->download($filename);
        } catch (\Exception $e) {
            // Log the error
            \Log::error('PDF Generation Error', [
                'sale_id' => $sale->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            abort(500, 'Errore durante la generazione del PDF: '.$e->getMessage());
        }
    }
}

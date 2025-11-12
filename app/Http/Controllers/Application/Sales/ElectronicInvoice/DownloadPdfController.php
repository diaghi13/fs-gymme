<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class DownloadPdfController extends Controller
{
    /**
     * Download PDF rappresentazione tabellare della fattura elettronica
     */
    public function __invoke(Sale $sale): Response
    {
        // Verifica che esista una fattura elettronica
        if (! $sale->electronic_invoice) {
            abort(404, 'Fattura elettronica non trovata');
        }

        // Eager load relazioni necessarie per il PDF
        $sale->load([
            'customer',
            'saleRows.vatRate',
            'electronic_invoice',
            'documentType',
            'paymentCondition',
            'financialResource',
            'structure',
        ]);

        // Get tenant data
        $tenant = tenant();

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
    }
}

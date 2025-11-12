<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadXmlController extends Controller
{
    public function __invoke(Sale $sale): StreamedResponse
    {
        if (! $sale->electronic_invoice) {
            abort(404, 'Fattura elettronica non trovata');
        }

        $filename = "{$sale->electronic_invoice->transmission_id}.xml";
        $filePath = $sale->electronic_invoice->xml_file_path;

        if (! Storage::disk('local')->exists($filePath)) {
            abort(404, 'File XML non trovato');
        }

        return Storage::disk('local')->download($filePath, $filename, [
            'Content-Type' => 'application/xml',
        ]);
    }
}

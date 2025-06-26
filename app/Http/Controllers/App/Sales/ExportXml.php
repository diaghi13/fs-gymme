<?php

namespace App\Http\Controllers\App\Sales;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Sale\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExportXml extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Sale $sale)
    {
        $sale->load([
            'customer',
            'payment_condition',
            'financial_resource',
            'promotion',
            'rows' => [
                'vat_rate',
            ],
            'payments' => [
                'payment_method',
            ],
        ]);

        $sale->append('summary_data');

        //dd($sale->summary_data);

        $company = Company::query()->first();

        //dd($sale->rows);

        $xml = view('sales.export-xml', [
            'sale' => $sale,
            'company' => $company,
        ])->render();

        // Download the XML file
        return response($xml)->withHeaders([
            'Content-Type' => 'application/xml',
            'Content-Disposition' => 'attachment; filename="vendita_' . $sale->progressive_number . '_' . $sale->year . '_' . $sale->date->format('YmdHis') . '_' . $sale->customer->uuid . '.xml"',
        ]);

        $documentoXML = $xml; // File XML da firmare
        $chiavePrivata = 'file://' . Storage::disk('local')->path('/certificates/key.pem');  // File della chiave privata
        $certificato = Storage::disk('local')->get('/certificates/cert.pem');   // File del certificato
        $outputP7M =  base_path(__FILE__) . 'vendita_' . $sale->progressive_number . '_' . $sale->year . '_' . $sale->date->format('YmdHis') . '_' . $sale->customer->uuid . 'firmato.p7m';       // File P7M da creare
        $hashAlgoritmo = 'SHA256';       // Algoritmo di hash (SHA1, SHA256, etc.)

        //dd($chiavePrivata);

// Leggi il documento XML
        //$documento = file_get_contents($documentoXML);

        //dd($documento);

// Crea il file P7M con la firma
        if (openssl_pkcs7_sign($documentoXML, $outputP7M, $certificato, $chiavePrivata, array('hash' => $hashAlgoritmo, 'sign-algorithm' => 'sha256'))) {
            echo "Firma P7M creata con successo: " . $outputP7M . "\n";
        } else {
            $errore = openssl_error_string();
            echo "Errore durante la firma P7M: " . $errore . "\n";
        }
    }
}

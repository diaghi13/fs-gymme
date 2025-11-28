<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class SamplePdfController extends Controller
{
    /**
     * Generate a sample PDF with fake data for template preview
     */
    public function __invoke(Request $request)
    {
        $template = $request->input('template', 'classic');

        // Validate template
        $validTemplates = ['classic', 'modern', 'minimal'];
        if (! in_array($template, $validTemplates)) {
            $template = 'classic';
        }

        // Get tenant
        $tenant = tenant();
        if (! $tenant) {
            abort(500, 'Tenant non trovato');
        }

        // Get PDF settings
        $pdfSettings = [
            'logo_path' => TenantSetting::get('invoice.pdf_logo_path', ''),
            'footer' => TenantSetting::get('invoice.pdf_footer', ''),
            'show_stamp' => TenantSetting::get('invoice.pdf_show_stamp', true),
            'legal_notes' => TenantSetting::get('invoice.pdf_legal_notes', ''),
        ];

        // Create fake sale data for preview
        $fakeSale = $this->createFakeSaleData();

        try {
            // Generate PDF with selected template
            $pdf = Pdf::loadView("pdf.electronic-invoice-{$template}", [
                'sale' => $fakeSale,
                'tenant' => $tenant,
                'pdfSettings' => $pdfSettings,
            ]);

            $pdf->setPaper('a4', 'portrait');
            $pdf->setOption('defaultFont', 'DejaVu Sans');

            return $pdf->stream("Anteprima_Template_{$template}.pdf");
        } catch (\Exception $e) {
            \Log::error('Sample PDF Generation Error', [
                'template' => $template,
                'error' => $e->getMessage(),
            ]);

            abort(500, 'Errore durante la generazione del PDF di anteprima');
        }
    }

    /**
     * Create fake sale data for preview
     */
    private function createFakeSaleData()
    {
        $date = now();

        // Create a fake sale object
        $sale = (object) [
            'id' => 1,
            'progressive_number' => 'FT-2025-0001',
            'date' => $date,
            'stamp_duty_applied' => true,
            'stamp_duty_amount' => 2.00,
            'electronic_invoice' => (object) [
                'transmission_id' => '00001',
            ],
            'customer' => (object) [
                'company_name' => 'Esempio S.r.l.',
                'first_name' => 'Mario',
                'last_name' => 'Rossi',
                'vat_number' => '12345678901',
                'tax_code' => 'RSSMRA80A01H501U',
                'street' => 'Via Roma',
                'number' => '123',
                'address' => 'Via Roma 123',
                'zip' => '20100',
                'postal_code' => '20100',
                'city' => 'Milano',
                'province' => 'MI',
            ],
            'rows' => collect([
                (object) [
                    'description' => 'Abbonamento mensile palestra',
                    'quantity' => 1,
                    'unit_measure' => 'pz',
                    'unit_price_net' => 50.00,
                    'percentage_discount' => null,
                    'absolute_discount' => null,
                    'total_net' => 50.00,
                    'total_gross' => 61.00,
                    'vat_amount' => 11.00,
                    'vat_rate' => (object) [
                        'percentage' => 22,
                        'code' => 'IVA22',
                        'nature' => null,
                        'description' => null,
                    ],
                ],
                (object) [
                    'description' => 'Lezioni di personal training (5 sedute)',
                    'quantity' => 5,
                    'unit_measure' => 'ora',
                    'unit_price_net' => 40.00,
                    'percentage_discount' => 10.00,
                    'absolute_discount' => null,
                    'total_net' => 180.00,
                    'total_gross' => 219.60,
                    'vat_amount' => 39.60,
                    'vat_rate' => (object) [
                        'percentage' => 22,
                        'code' => 'IVA22',
                        'nature' => null,
                        'description' => null,
                    ],
                ],
                (object) [
                    'description' => 'Corso di gruppo yoga',
                    'quantity' => 1,
                    'unit_measure' => 'pz',
                    'unit_price_net' => 80.00,
                    'percentage_discount' => null,
                    'absolute_discount' => null,
                    'total_net' => 80.00,
                    'total_gross' => 97.60,
                    'vat_amount' => 17.60,
                    'vat_rate' => (object) [
                        'percentage' => 22,
                        'code' => 'IVA22',
                        'nature' => null,
                        'description' => null,
                    ],
                ],
            ]),
            'payments' => collect([
                (object) [
                    'due_date' => $date->copy()->addDays(30)->format('Y-m-d'),
                    'amount' => 380.20,
                    'is_payed' => false,
                    'payment_method' => (object) [
                        'description' => 'Bonifico Bancario',
                    ],
                ],
            ]),
        ];

        return $sale;
    }
}

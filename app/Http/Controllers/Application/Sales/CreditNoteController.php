<?php

namespace App\Http\Controllers\Application\Sales;

use App\Enums\ElectronicInvoiceStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Models\Support\DocumentTypeElectronicInvoice;
use App\Services\Sale\ProgressiveNumberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreditNoteController extends Controller
{
    /**
     * Create a credit note from an existing sale
     */
    public function __invoke(Request $request, Sale $sale): RedirectResponse
    {
        // Validate that sale has an accepted electronic invoice
        if (! $sale->electronic_invoice) {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'Non puoi creare una nota di credito per una vendita senza fattura elettronica');
        }

        $sdiStatus = $sale->electronic_invoice->sdi_status instanceof ElectronicInvoiceStatusEnum
            ? $sale->electronic_invoice->sdi_status->value
            : $sale->electronic_invoice->sdi_status;

        if ($sdiStatus !== 'accepted') {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'Puoi creare una nota di credito solo per fatture accettate dal SDI');
        }

        // Prevent credit notes on credit notes
        if ($sale->type === 'credit_note') {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'Non puoi creare una nota di credito da un\'altra nota di credito');
        }

        try {
            $creditNote = DB::transaction(function () use ($sale) {
                // Load original sale with all relationships
                $sale->load(['rows.vat_rate', 'payments', 'customer']);

                // Generate new progressive number for credit note
                $progressiveNumberService = new ProgressiveNumberService;
                $progressiveData = $progressiveNumberService->generateNextForCurrentYear();

                // Get TD04 (Credit Note) electronic invoice type
                $td04 = DocumentTypeElectronicInvoice::where('code', 'TD04')->first();

                // Create credit note as new sale
                $creditNote = Sale::create([
                    'type' => 'credit_note',
                    'original_sale_id' => $sale->id,
                    'document_type_id' => 4, // Nota di credito
                    'document_type_electronic_invoice_id' => $td04?->id,
                    'progressive_number' => $progressiveData['progressive_number'],
                    'progressive_number_prefix' => $progressiveData['progressive_number_prefix'],
                    'progressive_number_value' => $progressiveData['progressive_number_value'],
                    'date' => now(),
                    'year' => $progressiveData['year'],
                    'customer_id' => $sale->customer_id,
                    'payment_condition_id' => $sale->payment_condition_id,
                    'financial_resource_id' => $sale->financial_resource_id,
                    'promotion_id' => $sale->promotion_id,
                    'discount_percentage' => $sale->discount_percentage,
                    'discount_absolute' => $sale->discount_absolute,
                    'status' => 'saved',
                    'payment_status' => 'paid', // Credit notes are typically pre-paid
                    'accounting_status' => 'not_accounted',
                    'exported_status' => 'not_exported',
                    'currency' => $sale->currency,
                    'tax_included' => $sale->tax_included,
                    'notes' => 'Nota di credito per fattura '.$sale->progressive_number,
                    'causale' => 'Storno fattura '.$sale->progressive_number,
                    'withholding_tax_amount' => $sale->withholding_tax_amount,
                    'withholding_tax_rate' => $sale->withholding_tax_rate,
                    'withholding_tax_type' => $sale->withholding_tax_type,
                    'stamp_duty_applied' => $sale->stamp_duty_applied,
                    'stamp_duty_amount' => $sale->stamp_duty_amount,
                    'welfare_fund_type' => $sale->welfare_fund_type,
                    'welfare_fund_rate' => $sale->welfare_fund_rate,
                    'welfare_fund_amount' => $sale->welfare_fund_amount,
                    'welfare_fund_taxable_amount' => $sale->welfare_fund_taxable_amount,
                    'welfare_fund_vat_rate_id' => $sale->welfare_fund_vat_rate_id,
                ]);

                // Duplicate rows with POSITIVE values (TD04 uses positive amounts)
                foreach ($sale->rows as $row) {
                    // Replicate row to preserve all fields
                    $newRow = $row->replicate();

                    // Keep all values POSITIVE - TD04 indicates it's a credit note
                    // The SDI automatically knows to subtract these amounts
                    $newRow->sale_id = $creditNote->id;
                    $newRow->save();
                }

                return $creditNote;
            });

            return redirect()->route('app.sales.show', [
                'tenant' => $request->session()->get('current_tenant_id'),
                'sale' => $creditNote->id,
            ])
                ->with('status', 'success')
                ->with('message', 'Nota di credito creata con successo. Ricordati di inviarla al SDI.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('status', 'error')
                ->with('message', 'Errore nella creazione della nota di credito: '.$e->getMessage());
        }
    }
}

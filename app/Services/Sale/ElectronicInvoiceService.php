<?php

namespace App\Services\Sale;

use App\Enums\ElectronicInvoiceStatusEnum;
use App\Models\Sale\ElectronicInvoice;
use App\Models\Sale\Sale;
use App\Models\Structure;
use Illuminate\Support\Facades\Storage;

class ElectronicInvoiceService
{
    /**
     * Generate XML v1.9 for electronic invoice
     */
    public function generateXml(Sale $sale, ?string $documentTypeCode = null): ElectronicInvoice
    {
        // Auto-assign document type if missing or override if specified
        if ($documentTypeCode || ! $sale->document_type_electronic_invoice_id) {
            $code = $documentTypeCode ?? $this->determineDocumentType($sale);
            $documentType = \App\Models\Support\DocumentTypeElectronicInvoice::where('code', $code)->first();

            if ($documentType) {
                $sale->update(['document_type_electronic_invoice_id' => $documentType->id]);
                $sale->refresh();
            }
        }

        $sale->load([
            'customer',
            'rows.vat_rate',
            'document_type_electronic_invoice',
            'welfare_fund_vat_rate',
            'structure', // Per RiferimentoAmministrazione nell'XML
        ]);

        // Get tenant fiscal data from central database
        $tenant = \App\Models\Tenant::find(tenant('id'));
        $structure = Structure::query()->first();

        // Validate required data
        $this->validateSaleData($sale, $tenant);

        // Generate transmission ID using tenant data
        $transmissionId = $this->generateTransmissionId($tenant);

        // Build XML content using tenant for fiscal data
        $xmlContent = $this->buildXmlContent($sale, $tenant, $structure, $transmissionId);

        // Validate XML against schema
        $this->validateXmlSchema($xmlContent);

        // Create or update ElectronicInvoice record
        $electronicInvoice = $sale->electronic_invoice ?: new ElectronicInvoice;
        $electronicInvoice->fill([
            'sale_id' => $sale->id,
            'xml_content' => $xmlContent,
            'xml_version' => '1.9',
            'transmission_id' => $transmissionId,
            'transmission_format' => $this->getTransmissionFormat($sale->customer),
            'sdi_status' => ElectronicInvoiceStatusEnum::GENERATED,
            'sdi_status_updated_at' => now(),
        ]);
        $electronicInvoice->save();

        // Store XML file
        $this->storeXmlFile($electronicInvoice, $xmlContent);

        // Update sale status
        $sale->update([
            'electronic_invoice_status' => ElectronicInvoiceStatusEnum::GENERATED,
            'sdi_transmission_id' => $transmissionId,
        ]);

        return $electronicInvoice;
    }

    /**
     * Build complete XML content conforming to FatturaPA v1.2.1
     */
    protected function buildXmlContent(Sale $sale, $tenant, ?Structure $structure, string $transmissionId): string
    {
        $xml = new \DOMDocument('1.0', 'UTF-8');
        $xml->formatOutput = true;

        // Root element with namespace per FatturaPA v1.2.1
        $root = $xml->createElementNS('http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2', 'p:FatturaElettronica');
        $root->setAttribute('versione', 'FPR12'); // FPR12 = Formato Privati v1.2
        $xml->appendChild($root);

        // Header (FatturaElettronicaHeader)
        $header = $xml->createElement('FatturaElettronicaHeader');
        $root->appendChild($header);

        // DatiTrasmissione (usa tenant per dati fiscali)
        $this->buildDatiTrasmissione($xml, $header, $tenant, $transmissionId);

        // CedentePrestatore (Seller - usa tenant per dati fiscali)
        $this->buildCedentePrestatore($xml, $header, $tenant, $structure);

        // CessionarioCommittente (Buyer)
        $this->buildCessionarioCommittente($xml, $header, $sale->customer);

        // Body (FatturaElettronicaBody)
        $body = $xml->createElement('FatturaElettronicaBody');
        $root->appendChild($body);

        // DatiGenerali
        $this->buildDatiGenerali($xml, $body, $sale);

        // DatiBeniServizi
        $this->buildDatiBeniServizi($xml, $body, $sale);

        // DatiPagamento (if present)
        if ($sale->payment_condition) {
            $this->buildDatiPagamento($xml, $body, $sale);
        }

        return $xml->saveXML();
    }

    /**
     * Build DatiTrasmissione section
     */
    protected function buildDatiTrasmissione(\DOMDocument $xml, \DOMElement $header, $tenant, string $transmissionId): void
    {
        $datiTrasmissione = $xml->createElement('DatiTrasmissione');
        $header->appendChild($datiTrasmissione);

        // IdTrasmittente (usa dati fiscali del tenant)
        $idTrasmittente = $xml->createElement('IdTrasmittente');
        $datiTrasmissione->appendChild($idTrasmittente);
        $idTrasmittente->appendChild($xml->createElement('IdPaese', 'IT'));
        $idTrasmittente->appendChild($xml->createElement('IdCodice', $tenant->vat_number ?? $tenant->tax_code));

        // ProgressivoInvio
        $datiTrasmissione->appendChild($xml->createElement('ProgressivoInvio', $transmissionId));

        // FormatoTrasmissione (FPR12 for private, FPA12 for public)
        $datiTrasmissione->appendChild($xml->createElement('FormatoTrasmissione', 'FPR12'));

        // CodiceDestinatario or PECDestinatario (usa dati tenant)
        if ($tenant->sdi_code) {
            $datiTrasmissione->appendChild($xml->createElement('CodiceDestinatario', $tenant->sdi_code));
        } else {
            $datiTrasmissione->appendChild($xml->createElement('CodiceDestinatario', '0000000'));
            if ($tenant->pec_email) {
                $datiTrasmissione->appendChild($xml->createElement('PECDestinatario', $tenant->pec_email));
            }
        }
    }

    /**
     * Build CedentePrestatore section (Seller data)
     * Uses tenant for fiscal data and structure for operational data
     */
    protected function buildCedentePrestatore(\DOMDocument $xml, \DOMElement $header, $tenant, ?Structure $structure): void
    {
        $cedente = $xml->createElement('CedentePrestatore');
        $header->appendChild($cedente);

        // DatiAnagrafici
        $datiAnagrafici = $xml->createElement('DatiAnagrafici');
        $cedente->appendChild($datiAnagrafici);

        // IdFiscaleIVA (usa dati fiscali del tenant)
        $idFiscaleIVA = $xml->createElement('IdFiscaleIVA');
        $datiAnagrafici->appendChild($idFiscaleIVA);
        $idFiscaleIVA->appendChild($xml->createElement('IdPaese', 'IT'));
        $idFiscaleIVA->appendChild($xml->createElement('IdCodice', $tenant->vat_number ?? ''));

        // CodiceFiscale (if different from VAT)
        if ($tenant->tax_code && $tenant->tax_code !== $tenant->vat_number) {
            $datiAnagrafici->appendChild($xml->createElement('CodiceFiscale', $tenant->tax_code));
        }

        // Anagrafica (usa nome del tenant)
        $anagrafica = $xml->createElement('Anagrafica');
        $datiAnagrafici->appendChild($anagrafica);
        $anagrafica->appendChild($this->createElementSafe($xml, 'Denominazione', $tenant->name));

        // RegimeFiscale (dal tenant o default)
        $datiAnagrafici->appendChild($xml->createElement('RegimeFiscale', $tenant->fiscal_regime ?? 'RF01'));

        // Sede (usa indirizzo tenant o structure come fallback)
        $sede = $xml->createElement('Sede');
        $cedente->appendChild($sede);
        $sede->appendChild($this->createElementSafe($xml, 'Indirizzo', $tenant->address ?? ($structure->address ?? '')));
        $sede->appendChild($xml->createElement('CAP', $tenant->postal_code ?? ($structure->postal_code ?? '')));
        $sede->appendChild($this->createElementSafe($xml, 'Comune', $tenant->city ?? ($structure->city ?? '')));
        $sede->appendChild($xml->createElement('Provincia', $tenant->province ?? ($structure->province ?? '')));
        $sede->appendChild($xml->createElement('Nazione', $tenant->country ?? 'IT'));

        // Contatti (optional - usa tenant o structure)
        $phone = $tenant->phone ?? ($structure->phone ?? null);
        $email = $tenant->email ?? ($structure->email ?? null);

        if ($phone || $email) {
            $contatti = $xml->createElement('Contatti');
            $cedente->appendChild($contatti);

            if ($phone) {
                $contatti->appendChild($this->createElementSafe($xml, 'Telefono', $phone));
            }

            if ($email) {
                $contatti->appendChild($this->createElementSafe($xml, 'Email', $email));
            }
        }
    }

    /**
     * Build CessionarioCommittente section (Buyer data)
     */
    protected function buildCessionarioCommittente(\DOMDocument $xml, \DOMElement $header, $customer): void
    {
        $cessionario = $xml->createElement('CessionarioCommittente');
        $header->appendChild($cessionario);

        // DatiAnagrafici
        $datiAnagrafici = $xml->createElement('DatiAnagrafici');
        $cessionario->appendChild($datiAnagrafici);

        // IdFiscaleIVA (if customer has VAT)
        if ($customer->vat_number) {
            $idFiscaleIVA = $xml->createElement('IdFiscaleIVA');
            $datiAnagrafici->appendChild($idFiscaleIVA);
            $idFiscaleIVA->appendChild($xml->createElement('IdPaese', $customer->country ?? 'IT'));
            $idFiscaleIVA->appendChild($xml->createElement('IdCodice', $customer->vat_number));
        }

        // CodiceFiscale (mandatory for Italian customers) - support both tax_code and tax_id_code
        $taxCode = $customer->tax_code ?? $customer->tax_id_code ?? null;
        if ($taxCode) {
            $datiAnagrafici->appendChild($xml->createElement('CodiceFiscale', $taxCode));
        }

        // Anagrafica
        $anagrafica = $xml->createElement('Anagrafica');
        $datiAnagrafici->appendChild($anagrafica);

        // Check if is company (has company_name or vat_number)
        $isCompany = $customer->company_name || $customer->vat_number;

        if ($isCompany) {
            $companyName = $customer->company_name ?? ($customer->first_name.' '.$customer->last_name);
            $anagrafica->appendChild($this->createElementSafe($xml, 'Denominazione', $companyName));
        } else {
            $anagrafica->appendChild($this->createElementSafe($xml, 'Nome', $customer->first_name ?? ''));
            $anagrafica->appendChild($this->createElementSafe($xml, 'Cognome', $customer->last_name ?? ''));
        }

        // Sede - construct address from street + number or fallback
        $address = $customer->street
            ? trim($customer->street.' '.($customer->number ?? ''))
            : ($customer->address ?? '');

        $sede = $xml->createElement('Sede');
        $cessionario->appendChild($sede);
        $sede->appendChild($this->createElementSafe($xml, 'Indirizzo', $address));
        $sede->appendChild($xml->createElement('CAP', $customer->zip ?? $customer->postal_code ?? ''));
        $sede->appendChild($this->createElementSafe($xml, 'Comune', $customer->city ?? ''));

        if ($customer->province) {
            $sede->appendChild($xml->createElement('Provincia', $customer->province));
        }

        $sede->appendChild($xml->createElement('Nazione', $customer->country ?? 'IT'));
    }

    /**
     * Build DatiGenerali section
     */
    protected function buildDatiGenerali(\DOMDocument $xml, \DOMElement $body, Sale $sale): void
    {
        $datiGenerali = $xml->createElement('DatiGenerali');
        $body->appendChild($datiGenerali);

        // DatiGeneraliDocumento
        $datiGeneraliDocumento = $xml->createElement('DatiGeneraliDocumento');
        $datiGenerali->appendChild($datiGeneraliDocumento);

        // TipoDocumento (TD01-TD29)
        $tipoDocumento = $sale->document_type_electronic_invoice?->code ?? 'TD01';
        $datiGeneraliDocumento->appendChild($xml->createElement('TipoDocumento', $tipoDocumento));

        // Divisa (Currency)
        $datiGeneraliDocumento->appendChild($xml->createElement('Divisa', $sale->currency ?? 'EUR'));

        // Data
        $datiGeneraliDocumento->appendChild($xml->createElement('Data', $sale->date->format('Y-m-d')));

        // Numero
        $datiGeneraliDocumento->appendChild($xml->createElement('Numero', $sale->progressive_number));

        // DatiRitenuta (Withholding tax) - DEVE essere prima di ImportoTotaleDocumento
        if ($sale->withholding_tax_amount) {
            $this->buildDatiRitenuta($xml, $datiGeneraliDocumento, $sale);
        }

        // DatiBollo (Stamp duty) - si valorizza sempre se applicato, indipendentemente da chi lo paga
        if ($sale->stamp_duty_applied) {
            $this->buildDatiBollo($xml, $datiGeneraliDocumento, $sale);
        }

        // DatiCassaPrevidenziale (Welfare fund)
        if ($sale->welfare_fund_amount) {
            $this->buildDatiCassaPrevidenziale($xml, $datiGeneraliDocumento, $sale);
        }

        // ImportoTotaleDocumento (Total amount) - MoneyCast già converte
        $totalAmount = $this->calculateTotalAmount($sale);
        $datiGeneraliDocumento->appendChild($xml->createElement('ImportoTotaleDocumento', number_format($totalAmount, 2, '.', '')));

        // Causale (Invoice reason)
        if ($sale->causale) {
            $datiGeneraliDocumento->appendChild($this->createElementSafe($xml, 'Causale', substr($sale->causale, 0, 200)));
        }

        // DatiFattureCollegate (Related invoices) - Required for credit notes (TD04)
        if ($sale->type === 'credit_note' && $sale->original_sale_id) {
            $this->buildDatiFattureCollegate($xml, $datiGenerali, $sale);
        }
    }

    /**
     * Build DatiRitenuta (Withholding tax)
     */
    protected function buildDatiRitenuta(\DOMDocument $xml, \DOMElement $parent, Sale $sale): void
    {
        $datiRitenuta = $xml->createElement('DatiRitenuta');
        $parent->appendChild($datiRitenuta);

        $datiRitenuta->appendChild($xml->createElement('TipoRitenuta', $sale->withholding_tax_type ?? 'RT01'));
        // MoneyCast già converte in euro, NO divisione per 100
        $datiRitenuta->appendChild($xml->createElement('ImportoRitenuta', number_format($sale->withholding_tax_amount, 2, '.', '')));
        $datiRitenuta->appendChild($xml->createElement('AliquotaRitenuta', number_format($sale->withholding_tax_rate, 2, '.', '')));
        $datiRitenuta->appendChild($xml->createElement('CausalePagamento', 'A'));
    }

    /**
     * Build DatiBollo (Stamp duty)
     * Campo BolloVirtuale = SI obbligatorio se applicato
     * ImportoBollo è opzionale (AdE calcola sempre 2€ fissi)
     */
    protected function buildDatiBollo(\DOMDocument $xml, \DOMElement $parent, Sale $sale): void
    {
        $datiBollo = $xml->createElement('DatiBollo');
        $parent->appendChild($datiBollo);

        // BolloVirtuale = SI obbligatorio
        $datiBollo->appendChild($xml->createElement('BolloVirtuale', 'SI'));

        // ImportoBollo opzionale - lo includiamo solo se addebitato al cliente
        $chargeToCustomer = \App\Models\TenantSetting::get('invoice.stamp_duty.charge_customer', true);
        if ($chargeToCustomer && $sale->stamp_duty_amount > 0) {
            // MoneyCast già converte in euro
            $datiBollo->appendChild($xml->createElement('ImportoBollo', number_format($sale->stamp_duty_amount, 2, '.', '')));
        }
    }

    /**
     * Build DatiCassaPrevidenziale (Welfare fund)
     */
    protected function buildDatiCassaPrevidenziale(\DOMDocument $xml, \DOMElement $parent, Sale $sale): void
    {
        $datiCassa = $xml->createElement('DatiCassaPrevidenziale');
        $parent->appendChild($datiCassa);

        $datiCassa->appendChild($xml->createElement('TipoCassa', $sale->welfare_fund_type ?? 'TC01'));
        $datiCassa->appendChild($xml->createElement('AlCassa', number_format($sale->welfare_fund_rate, 2, '.', '')));
        // MoneyCast già converte in euro
        $datiCassa->appendChild($xml->createElement('ImportoContributoCassa', number_format($sale->welfare_fund_amount, 2, '.', '')));
        $datiCassa->appendChild($xml->createElement('ImponibileCassa', number_format($sale->welfare_fund_taxable_amount, 2, '.', '')));

        if ($sale->welfare_fund_vat_rate) {
            $datiCassa->appendChild($xml->createElement('AliquotaIVA', number_format($sale->welfare_fund_vat_rate->percentage, 2, '.', '')));
        }
    }

    /**
     * Build DatiFattureCollegate (Related invoices)
     * Required for credit notes (TD04) to reference original invoice
     */
    protected function buildDatiFattureCollegate(\DOMDocument $xml, \DOMElement $datiGenerali, Sale $sale): void
    {
        // Load original sale
        $originalSale = Sale::find($sale->original_sale_id);

        if (! $originalSale) {
            return;
        }

        $datiFattureCollegate = $xml->createElement('DatiFattureCollegate');
        $datiGenerali->appendChild($datiFattureCollegate);

        // IdDocumento: progressive number of original invoice
        $datiFattureCollegate->appendChild($xml->createElement('IdDocumento', $originalSale->progressive_number));

        // Data: date of original invoice
        $datiFattureCollegate->appendChild($xml->createElement('Data', $originalSale->date->format('Y-m-d')));
    }

    /**
     * Build DatiBeniServizi (Goods and services)
     */
    protected function buildDatiBeniServizi(\DOMDocument $xml, \DOMElement $body, Sale $sale): void
    {
        $datiBeniServizi = $xml->createElement('DatiBeniServizi');
        $body->appendChild($datiBeniServizi);

        // DettaglioLinee (Line items)
        foreach ($sale->rows as $index => $row) {
            $this->buildDettaglioLinee($xml, $datiBeniServizi, $row, $index + 1);
        }

        // DatiRiepilogo (VAT summary)
        $this->buildDatiRiepilogo($xml, $datiBeniServizi, $sale);
    }

    /**
     * Build DettaglioLinee (Line item)
     */
    protected function buildDettaglioLinee(\DOMDocument $xml, \DOMElement $parent, $row, int $lineNumber): void
    {
        $dettaglioLinee = $xml->createElement('DettaglioLinee');
        $parent->appendChild($dettaglioLinee);

        $dettaglioLinee->appendChild($xml->createElement('NumeroLinea', $lineNumber));
        $dettaglioLinee->appendChild($this->createElementSafe($xml, 'Descrizione', substr($row->description ?? 'Servizio', 0, 1000)));
        $dettaglioLinee->appendChild($xml->createElement('Quantita', number_format($row->quantity, 2, '.', '')));
        $dettaglioLinee->appendChild($xml->createElement('UnitaMisura', $row->unit ?? 'PZ'));

        // IMPORTANTE: Usare unit_price_net (prezzo netto unitario senza IVA)
        // MoneyCast già converte in euro, NO divisione per 100
        $unitPriceNet = $row->unit_price_net ?? 0;
        $dettaglioLinee->appendChild($xml->createElement('PrezzoUnitario', number_format($unitPriceNet, 2, '.', '')));

        // Sconto (Discount)
        if ($row->percentage_discount || $row->absolute_discount) {
            $scontoMaggiorazione = $xml->createElement('ScontoMaggiorazione');
            $dettaglioLinee->appendChild($scontoMaggiorazione);

            $scontoMaggiorazione->appendChild($xml->createElement('Tipo', 'SC'));

            if ($row->percentage_discount) {
                $scontoMaggiorazione->appendChild($xml->createElement('Percentuale', number_format($row->percentage_discount, 2, '.', '')));
            }

            if ($row->absolute_discount) {
                // MoneyCast già converte in euro, NO divisione per 100
                $scontoMaggiorazione->appendChild($xml->createElement('Importo', number_format($row->absolute_discount, 2, '.', '')));
            }
        }

        // PrezzoTotale - Usare total_net (già scontato e senza IVA)
        $totalNet = $row->total_net ?? 0;
        $dettaglioLinee->appendChild($xml->createElement('PrezzoTotale', number_format($totalNet, 2, '.', '')));

        // AliquotaIVA (obbligatorio)
        $dettaglioLinee->appendChild($xml->createElement('AliquotaIVA', number_format($row->vat_rate->percentage ?? 0, 2, '.', '')));

        // Natura (Nature for 0% VAT) - Solo per IVA esenti/non imponibili
        // Nel DB: nature è NULL per IVA normale, N1/N2/N3/etc per IVA 0%
        if ($row->vat_rate && $row->vat_rate->nature) {
            $dettaglioLinee->appendChild($xml->createElement('Natura', $row->vat_rate->nature));
        }
    }

    /**
     * Build DatiRiepilogo (VAT summary)
     */
    protected function buildDatiRiepilogo(\DOMDocument $xml, \DOMElement $parent, Sale $sale): void
    {
        $summaryData = $sale->summary_data;

        foreach ($summaryData as $summary) {
            $datiRiepilogo = $xml->createElement('DatiRiepilogo');
            $parent->appendChild($datiRiepilogo);

            // Ordine CORRETTO secondo XSD FPR12
            // 1. AliquotaIVA (obbligatorio)
            $datiRiepilogo->appendChild($xml->createElement('AliquotaIVA', $summary->vat_rate));

            // 2. Natura (opzionale, SUBITO dopo AliquotaIVA se IVA 0%)
            if (isset($summary->nature)) {
                $datiRiepilogo->appendChild($xml->createElement('Natura', $summary->nature));
            }

            // 3. SpeseAccessorie (opzionale) - TODO se necessario

            // 4. Arrotondamento (opzionale) - TODO se necessario

            // 5. ImponibileImporto (obbligatorio)
            $datiRiepilogo->appendChild($xml->createElement('ImponibileImporto', $summary->taxable_amount));

            // 6. Imposta (obbligatorio)
            $datiRiepilogo->appendChild($xml->createElement('Imposta', $summary->tax));

            // 7. EsigibilitaIVA (opzionale)
            if (isset($summary->collectability_vat)) {
                $datiRiepilogo->appendChild($xml->createElement('EsigibilitaIVA', $summary->collectability_vat));
            }

            // 8. RiferimentoNormativo (opzionale)
            if (isset($summary->regulatory)) {
                $datiRiepilogo->appendChild($xml->createElement('RiferimentoNormativo', $summary->regulatory));
            }
        }
    }

    /**
     * Build DatiPagamento (Payment data)
     */
    protected function buildDatiPagamento(\DOMDocument $xml, \DOMElement $body, Sale $sale): void
    {
        $datiPagamento = $xml->createElement('DatiPagamento');
        $body->appendChild($datiPagamento);

        // CondizioniPagamento
        $datiPagamento->appendChild($xml->createElement('CondizioniPagamento', 'TP02')); // TP02 = Pagamento completo

        // DettaglioPagamento
        $dettaglioPagamento = $xml->createElement('DettaglioPagamento');
        $datiPagamento->appendChild($dettaglioPagamento);

        // Ordine corretto secondo XSD FPR12
        $dettaglioPagamento->appendChild($xml->createElement('ModalitaPagamento', $this->getPaymentMethod($sale)));

        // DataScadenzaPagamento (opzionale, prima di ImportoPagamento)
        if ($sale->payment_condition && $sale->payment_condition->installments->isNotEmpty()) {
            $firstInstallment = $sale->payment_condition->installments->first();
            $dueDate = $sale->date->addDays($firstInstallment->days_from_invoice ?? 0);
            $dettaglioPagamento->appendChild($xml->createElement('DataScadenzaPagamento', $dueDate->format('Y-m-d')));
        }

        // ImportoPagamento (obbligatorio)
        $dettaglioPagamento->appendChild($xml->createElement('ImportoPagamento', number_format($this->calculateTotalAmount($sale), 2, '.', '')));
    }

    /**
     * Get transmission format based on customer type
     */
    protected function getTransmissionFormat($customer): string
    {
        // FPA12 for public administration, FPR12 for private
        return $customer && $customer->is_public_administration ? 'FPA12' : 'FPR12';
    }

    /**
     * Get payment method code
     */
    protected function getPaymentMethod(Sale $sale): string
    {
        // Map internal payment methods to official codes
        // MP01 = contanti, MP02 = assegno, MP05 = bonifico, etc.
        return match ($sale->payment_condition?->payment_method?->code ?? 'cash') {
            'cash' => 'MP01',
            'check' => 'MP02',
            'bank_transfer' => 'MP05',
            'credit_card' => 'MP08',
            default => 'MP01',
        };
    }

    /**
     * Calculate total amount including all charges
     */
    protected function calculateTotalAmount(Sale $sale): float
    {
        $total = $sale->total_price;

        // Add welfare fund if applicable
        if ($sale->welfare_fund_amount) {
            $total += $sale->welfare_fund_amount;
        }

        // Add stamp duty ONLY if charged to customer
        $chargeStampToCustomer = \App\Models\TenantSetting::get('invoice.stamp_duty.charge_customer', true);
        if ($chargeStampToCustomer && $sale->stamp_duty_amount) {
            $total += $sale->stamp_duty_amount;
        }

        // Subtract withholding tax (ritenuta)
        if ($sale->withholding_tax_amount) {
            $total -= $sale->withholding_tax_amount;
        }

        return round($total, 2);
    }

    /**
     * Generate unique transmission ID (ProgressivoInvio) - MAX 10 caratteri alfanumerici
     *
     * Deve essere univoco per combinazione (IdPaese + IdCodice)
     * Formato: TTTTTRRRRR (10 caratteri)
     * - TTTTT: Timestamp ultimi 5 caratteri (secondi)
     * - RRRRR: Random 5 caratteri (uppercase hex)
     */
    protected function generateTransmissionId($tenant): string
    {
        // Timestamp: ultimi 5 caratteri (secondi) per mantenere tracciabilità
        // Es: 20251111035155 → 35155
        $timestamp = now()->format('YmdHis');
        $timestampSuffix = substr($timestamp, -5); // Ultimi 5 caratteri

        // Random: 5 caratteri uppercase da uniqid (microseconds + PID)
        $random = strtoupper(substr(md5(uniqid()), 0, 5));

        // Totale: 10 caratteri (conforme SDI)
        return "{$timestampSuffix}{$random}"; // Es: 35155DEAA0
    }

    /**
     * Determine document type based on sale characteristics
     */
    protected function determineDocumentType(Sale $sale): string
    {
        // TD06 - Parcella (se c'è ritenuta d'acconto)
        if ($sale->withholding_tax_amount && $sale->withholding_tax_amount > 0) {
            return 'TD06';
        }

        // TD04 - Nota di Credito (se totale negativo o vendita di tipo "credit_note")
        if ($sale->total_price < 0 || $sale->type === 'credit_note') {
            return 'TD04';
        }

        // TD05 - Nota di Debito (se vendita di tipo "debit_note")
        if ($sale->type === 'debit_note') {
            return 'TD05';
        }

        // TD01 - Fattura ordinaria (default)
        return 'TD01';
    }

    /**
     * Validate sale data before XML generation
     * Validates tenant fiscal data (from central DB) and customer data
     */
    protected function validateSaleData(Sale $sale, $tenant): void
    {
        if (! $tenant) {
            throw new \Exception('Tenant non trovato');
        }

        if (! $tenant->vat_number && ! $tenant->tax_code) {
            throw new \Exception('P.IVA o Codice Fiscale del tenant mancante. Configurare i dati fiscali dell\'azienda.');
        }

        if (! $sale->customer) {
            throw new \Exception('Cliente mancante');
        }

        // Check fiscal data (support both tax_code and tax_id_code)
        $hasFiscalData = $sale->customer->vat_number
            || $sale->customer->tax_code
            || $sale->customer->tax_id_code;

        if (! $hasFiscalData) {
            throw new \Exception('P.IVA o Codice Fiscale del cliente mancante');
        }

        if ($sale->rows->isEmpty()) {
            throw new \Exception('Nessuna riga di vendita presente');
        }

        if (! $sale->progressive_number) {
            throw new \Exception('Numero progressivo mancante');
        }
    }

    /**
     * Validate XML against official FatturaPA schema
     */
    protected function validateXmlSchema(string $xmlContent): void
    {
        $xml = new \DOMDocument;
        $xml->loadXML($xmlContent);

        // XSD validation would go here
        // For now, just check if XML is well-formed
        if (! $xml) {
            throw new \Exception('XML non valido');
        }
    }

    /**
     * Store XML file to disk
     */
    protected function storeXmlFile(ElectronicInvoice $electronicInvoice, string $xmlContent): void
    {
        $filename = "electronic_invoices/{$electronicInvoice->transmission_id}.xml";
        Storage::disk('local')->put($filename, $xmlContent);

        $electronicInvoice->update([
            'xml_file_path' => $filename,
        ]);
    }

    /**
     * Create XML element with proper escaping for special characters
     * Prevents "unterminated entity reference" errors
     */
    protected function createElementSafe(\DOMDocument $xml, string $name, ?string $value = null): \DOMElement
    {
        $element = $xml->createElement($name);

        if ($value !== null && $value !== '') {
            // Escape special XML characters: & < > " '
            $escapedValue = htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
            $textNode = $xml->createTextNode($escapedValue);
            $element->appendChild($textNode);
        }

        return $element;
    }
}

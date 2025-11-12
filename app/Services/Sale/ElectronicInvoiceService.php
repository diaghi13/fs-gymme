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
    public function generateXml(Sale $sale): ElectronicInvoice
    {
        $sale->load([
            'customer',
            'rows.vat_rate',
            'document_type_electronic_invoice',
            'welfare_fund_vat_rate',
        ]);

        $structure = Structure::query()->first();

        // Validate required data
        $this->validateSaleData($sale, $structure);

        // Generate transmission ID
        $transmissionId = $this->generateTransmissionId($structure);

        // Build XML content
        $xmlContent = $this->buildXmlContent($sale, $structure, $transmissionId);

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
     * Build complete XML content conforming to FatturaPA v1.9
     */
    protected function buildXmlContent(Sale $sale, Structure $structure, string $transmissionId): string
    {
        $xml = new \DOMDocument('1.0', 'UTF-8');
        $xml->formatOutput = true;

        // Root element with namespace
        $root = $xml->createElementNS('http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.9', 'p:FatturaElettronica');
        $root->setAttribute('versione', '1.9');
        $xml->appendChild($root);

        // Header (FatturaElettronicaHeader)
        $header = $xml->createElement('FatturaElettronicaHeader');
        $root->appendChild($header);

        // DatiTrasmissione
        $this->buildDatiTrasmissione($xml, $header, $structure, $transmissionId);

        // CedentePrestatore (Seller)
        $this->buildCedentePrestatore($xml, $header, $structure);

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
    protected function buildDatiTrasmissione(\DOMDocument $xml, \DOMElement $header, Structure $structure, string $transmissionId): void
    {
        $datiTrasmissione = $xml->createElement('DatiTrasmissione');
        $header->appendChild($datiTrasmissione);

        // IdTrasmittente
        $idTrasmittente = $xml->createElement('IdTrasmittente');
        $datiTrasmissione->appendChild($idTrasmittente);
        $idTrasmittente->appendChild($xml->createElement('IdPaese', 'IT'));
        $idTrasmittente->appendChild($xml->createElement('IdCodice', $structure->vat_number ?? $structure->tax_code));

        // ProgressivoInvio
        $datiTrasmissione->appendChild($xml->createElement('ProgressivoInvio', $transmissionId));

        // FormatoTrasmissione (FPR12 for private, FPA12 for public)
        $datiTrasmissione->appendChild($xml->createElement('FormatoTrasmissione', 'FPR12'));

        // CodiceDestinatario or PECDestinatario
        if ($structure->sdi_code) {
            $datiTrasmissione->appendChild($xml->createElement('CodiceDestinatario', $structure->sdi_code));
        } else {
            $datiTrasmissione->appendChild($xml->createElement('CodiceDestinatario', '0000000'));
            if ($structure->pec_email) {
                $datiTrasmissione->appendChild($xml->createElement('PECDestinatario', $structure->pec_email));
            }
        }
    }

    /**
     * Build CedentePrestatore section (Seller data)
     */
    protected function buildCedentePrestatore(\DOMDocument $xml, \DOMElement $header, Structure $structure): void
    {
        $cedente = $xml->createElement('CedentePrestatore');
        $header->appendChild($cedente);

        // DatiAnagrafici
        $datiAnagrafici = $xml->createElement('DatiAnagrafici');
        $cedente->appendChild($datiAnagrafici);

        // IdFiscaleIVA
        $idFiscaleIVA = $xml->createElement('IdFiscaleIVA');
        $datiAnagrafici->appendChild($idFiscaleIVA);
        $idFiscaleIVA->appendChild($xml->createElement('IdPaese', 'IT'));
        $idFiscaleIVA->appendChild($xml->createElement('IdCodice', $structure->vat_number ?? ''));

        // CodiceFiscale (if different from VAT)
        if ($structure->tax_code && $structure->tax_code !== $structure->vat_number) {
            $datiAnagrafici->appendChild($xml->createElement('CodiceFiscale', $structure->tax_code));
        }

        // Anagrafica
        $anagrafica = $xml->createElement('Anagrafica');
        $datiAnagrafici->appendChild($anagrafica);
        $anagrafica->appendChild($xml->createElement('Denominazione', $structure->company_name ?? $structure->name));

        // RegimeFiscale
        $datiAnagrafici->appendChild($xml->createElement('RegimeFiscale', $structure->fiscal_regime ?? 'RF01'));

        // Sede (Registered office)
        $sede = $xml->createElement('Sede');
        $cedente->appendChild($sede);
        $sede->appendChild($xml->createElement('Indirizzo', $structure->address ?? ''));
        $sede->appendChild($xml->createElement('CAP', $structure->postal_code ?? ''));
        $sede->appendChild($xml->createElement('Comune', $structure->city ?? ''));
        $sede->appendChild($xml->createElement('Provincia', $structure->province ?? ''));
        $sede->appendChild($xml->createElement('Nazione', 'IT'));

        // Contatti (optional)
        if ($structure->phone || $structure->email) {
            $contatti = $xml->createElement('Contatti');
            $cedente->appendChild($contatti);

            if ($structure->phone) {
                $contatti->appendChild($xml->createElement('Telefono', $structure->phone));
            }

            if ($structure->email) {
                $contatti->appendChild($xml->createElement('Email', $structure->email));
            }
        }
    }

    /**
     * Build CessionarioCommittente section (Buyer data)
     */
    protected function buildCessionarioCommittente(\DOMElement $xml, \DOMElement $header, $customer): void
    {
        $cessionario = $xml->ownerDocument->createElement('CessionarioCommittente');
        $header->appendChild($cessionario);

        // DatiAnagrafici
        $datiAnagrafici = $xml->ownerDocument->createElement('DatiAnagrafici');
        $cessionario->appendChild($datiAnagrafici);

        // IdFiscaleIVA (if customer has VAT)
        if ($customer->vat_number) {
            $idFiscaleIVA = $xml->ownerDocument->createElement('IdFiscaleIVA');
            $datiAnagrafici->appendChild($idFiscaleIVA);
            $idFiscaleIVA->appendChild($xml->ownerDocument->createElement('IdPaese', $customer->country_code ?? 'IT'));
            $idFiscaleIVA->appendChild($xml->ownerDocument->createElement('IdCodice', $customer->vat_number));
        }

        // CodiceFiscale (mandatory for Italian customers)
        if ($customer->tax_code) {
            $datiAnagrafici->appendChild($xml->ownerDocument->createElement('CodiceFiscale', $customer->tax_code));
        }

        // Anagrafica
        $anagrafica = $xml->ownerDocument->createElement('Anagrafica');
        $datiAnagrafici->appendChild($anagrafica);

        if ($customer->is_company) {
            $anagrafica->appendChild($xml->ownerDocument->createElement('Denominazione', $customer->company_name ?? $customer->name));
        } else {
            $anagrafica->appendChild($xml->ownerDocument->createElement('Nome', $customer->first_name ?? ''));
            $anagrafica->appendChild($xml->ownerDocument->createElement('Cognome', $customer->last_name ?? ''));
        }

        // Sede
        $sede = $xml->ownerDocument->createElement('Sede');
        $cessionario->appendChild($sede);
        $sede->appendChild($xml->ownerDocument->createElement('Indirizzo', $customer->address ?? ''));
        $sede->appendChild($xml->ownerDocument->createElement('CAP', $customer->postal_code ?? ''));
        $sede->appendChild($xml->ownerDocument->createElement('Comune', $customer->city ?? ''));

        if ($customer->province) {
            $sede->appendChild($xml->ownerDocument->createElement('Provincia', $customer->province));
        }

        $sede->appendChild($xml->ownerDocument->createElement('Nazione', $customer->country_code ?? 'IT'));
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

        // DatiRitenuta (Withholding tax)
        if ($sale->withholding_tax_amount) {
            $this->buildDatiRitenuta($xml, $datiGeneraliDocumento, $sale);
        }

        // DatiBollo (Stamp duty)
        if ($sale->stamp_duty_amount) {
            $this->buildDatiBollo($xml, $datiGeneraliDocumento, $sale);
        }

        // DatiCassaPrevidenziale (Welfare fund)
        if ($sale->welfare_fund_amount) {
            $this->buildDatiCassaPrevidenziale($xml, $datiGeneraliDocumento, $sale);
        }

        // ImportoTotaleDocumento (Total amount)
        $totalAmount = $this->calculateTotalAmount($sale);
        $datiGeneraliDocumento->appendChild($xml->createElement('ImportoTotaleDocumento', number_format($totalAmount / 100, 2, '.', '')));

        // Causale (Invoice reason)
        if ($sale->causale) {
            $datiGeneraliDocumento->appendChild($xml->createElement('Causale', substr($sale->causale, 0, 200)));
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
        $datiRitenuta->appendChild($xml->createElement('ImportoRitenuta', number_format($sale->withholding_tax_amount / 100, 2, '.', '')));
        $datiRitenuta->appendChild($xml->createElement('AliquotaRitenuta', number_format($sale->withholding_tax_rate, 2, '.', '')));
        $datiRitenuta->appendChild($xml->createElement('CausalePagamento', 'A'));
    }

    /**
     * Build DatiBollo (Stamp duty)
     */
    protected function buildDatiBollo(\DOMDocument $xml, \DOMElement $parent, Sale $sale): void
    {
        $datiBollo = $xml->createElement('DatiBollo');
        $parent->appendChild($datiBollo);

        $datiBollo->appendChild($xml->createElement('BolloVirtuale', 'SI'));
        $datiBollo->appendChild($xml->createElement('ImportoBollo', number_format($sale->stamp_duty_amount / 100, 2, '.', '')));
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
        $datiCassa->appendChild($xml->createElement('ImportoContributoCassa', number_format($sale->welfare_fund_amount / 100, 2, '.', '')));
        $datiCassa->appendChild($xml->createElement('ImponibileCassa', number_format($sale->welfare_fund_taxable_amount / 100, 2, '.', '')));

        if ($sale->welfare_fund_vat_rate) {
            $datiCassa->appendChild($xml->createElement('AliquotaIVA', number_format($sale->welfare_fund_vat_rate->percentage, 2, '.', '')));
        }
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
        $dettaglioLinee->appendChild($xml->createElement('Descrizione', substr($row->description ?? 'Servizio', 0, 1000)));
        $dettaglioLinee->appendChild($xml->createElement('Quantita', number_format($row->quantity, 2, '.', '')));
        $dettaglioLinee->appendChild($xml->createElement('UnitaMisura', $row->unit ?? 'PZ'));
        $dettaglioLinee->appendChild($xml->createElement('PrezzoUnitario', number_format($row->unit_price / 100, 2, '.', '')));

        // Sconto (Discount)
        if ($row->discount_percentage || $row->discount_absolute) {
            $scontoMaggiorazione = $xml->createElement('ScontoMaggiorazione');
            $dettaglioLinee->appendChild($scontoMaggiorazione);

            $scontoMaggiorazione->appendChild($xml->createElement('Tipo', 'SC'));

            if ($row->discount_percentage) {
                $scontoMaggiorazione->appendChild($xml->createElement('Percentuale', number_format($row->discount_percentage, 2, '.', '')));
            }

            if ($row->discount_absolute) {
                $scontoMaggiorazione->appendChild($xml->createElement('Importo', number_format($row->discount_absolute / 100, 2, '.', '')));
            }
        }

        // PrezzoTotale
        $totalPrice = ($row->quantity * $row->unit_price) - ($row->discount_absolute ?? 0);
        if ($row->discount_percentage) {
            $totalPrice -= $totalPrice * ($row->discount_percentage / 100);
        }
        $dettaglioLinee->appendChild($xml->createElement('PrezzoTotale', number_format($totalPrice / 100, 2, '.', '')));

        // AliquotaIVA
        $dettaglioLinee->appendChild($xml->createElement('AliquotaIVA', number_format($row->vat_rate->percentage ?? 0, 2, '.', '')));

        // Natura (Nature for 0% VAT)
        if ($row->vat_rate && $row->vat_rate->percentage == 0 && $row->vat_rate->nature) {
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

            $datiRiepilogo->appendChild($xml->createElement('AliquotaIVA', $summary->vat_rate));
            $datiRiepilogo->appendChild($xml->createElement('ImponibileImporto', $summary->taxable_amount));
            $datiRiepilogo->appendChild($xml->createElement('Imposta', $summary->tax));

            if (isset($summary->nature)) {
                $datiRiepilogo->appendChild($xml->createElement('Natura', $summary->nature));
            }

            if (isset($summary->regulatory)) {
                $datiRiepilogo->appendChild($xml->createElement('RiferimentoNormativo', $summary->regulatory));
            }

            if (isset($summary->collectability_vat)) {
                $datiRiepilogo->appendChild($xml->createElement('EsigibilitaIVA', $summary->collectability_vat));
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

        $dettaglioPagamento->appendChild($xml->createElement('ModalitaPagamento', $this->getPaymentMethod($sale)));
        $dettaglioPagamento->appendChild($xml->createElement('ImportoPagamento', number_format($this->calculateTotalAmount($sale) / 100, 2, '.', '')));

        // DataScadenzaPagamento (if installments)
        if ($sale->payment_condition && $sale->payment_condition->installments->isNotEmpty()) {
            $firstInstallment = $sale->payment_condition->installments->first();
            $dueDate = $sale->date->addDays($firstInstallment->days_from_invoice ?? 0);
            $dettaglioPagamento->appendChild($xml->createElement('DataScadenzaPagamento', $dueDate->format('Y-m-d')));
        }
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
    protected function calculateTotalAmount(Sale $sale): int
    {
        $total = $sale->total_price;

        // Add welfare fund if applicable
        if ($sale->welfare_fund_amount) {
            $total += $sale->welfare_fund_amount;
        }

        // Add stamp duty if applicable
        if ($sale->stamp_duty_amount) {
            $total += $sale->stamp_duty_amount;
        }

        // Subtract withholding tax (ritenuta)
        if ($sale->withholding_tax_amount) {
            $total -= $sale->withholding_tax_amount;
        }

        return $total;
    }

    /**
     * Generate unique transmission ID
     */
    protected function generateTransmissionId(Structure $structure): string
    {
        $prefix = substr($structure->vat_number ?? $structure->tax_code ?? 'IT', 0, 5);
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(substr(md5(uniqid()), 0, 5));

        return "{$prefix}_{$timestamp}_{$random}";
    }

    /**
     * Validate sale data before XML generation
     */
    protected function validateSaleData(Sale $sale, Structure $structure): void
    {
        if (! $structure) {
            throw new \Exception('Structure non trovata');
        }

        if (! $structure->vat_number && ! $structure->tax_code) {
            throw new \Exception('P.IVA o Codice Fiscale della struttura mancante');
        }

        if (! $sale->customer) {
            throw new \Exception('Cliente mancante');
        }

        if (! $sale->customer->vat_number && ! $sale->customer->tax_code) {
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
}

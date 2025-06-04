<?php
/** @var $company \App\Models\Company
 * @var $sale \App\Models\Sale\Sale
 * */
echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>
    <!--suppress HtmlUnknownTag -->
<b:FatturaElettronica xmlns:b="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPR12">
    <FatturaElettronicaHeader>
        <DatiTrasmissione>
            <IdTrasmittente>
                <IdPaese>IT</IdPaese>
                <IdCodice>{{ $company->vat_number }}</IdCodice>
            </IdTrasmittente>
            <ProgressivoInvio>{{ $sale->progressive_number . '/' . $sale->year }}</ProgressivoInvio>
            <FormatoTrasmissione>FPR12</FormatoTrasmissione>
            <CodiceDestinatario>{{ $customer->sdi ?? '0000000' }}</CodiceDestinatario>
            {{--            <ContattiTrasmittente>--}}
            {{--                <Email>fatturapa@documi.it</Email>--}}
            {{--            </ContattiTrasmittente>--}}
        </DatiTrasmissione>
        <CedentePrestatore>
            <DatiAnagrafici>
                <IdFiscaleIVA>
                    <IdPaese>IT</IdPaese>
                    <IdCodice>{{ $company->vat_number }}</IdCodice>
                </IdFiscaleIVA>
                <CodiceFiscale>{{ $company->tax_code }}</CodiceFiscale>
                <Anagrafica>
                    <Denominazione>{{ $company->business_name }}</Denominazione>
                </Anagrafica>
                <RegimeFiscale>RF01</RegimeFiscale>
            </DatiAnagrafici>
            <Sede>
                <Indirizzo>{{ $company->street . ', ' . $company->number }}</Indirizzo>
                <CAP>{{ $company->zip_code }}</CAP>
                <Comune>{{ $company->city }}</Comune>
                <Provincia>{{ $company->province }}</Provincia>
                <Nazione>{{ $company->country }}</Nazione>
            </Sede>
            {{--            <IscrizioneREA>--}}
            {{--                <Ufficio>MI</Ufficio>--}}
            {{--                <NumeroREA>2045681</NumeroREA>--}}
            {{--                <CapitaleSociale>10000.00</CapitaleSociale>--}}
            {{--                <SocioUnico>SM</SocioUnico>--}}
            {{--                <StatoLiquidazione>LN</StatoLiquidazione>--}}
            {{--            </IscrizioneREA>--}}
            {{--            <Contatti>--}}
            {{--                <Email>vincenzodonghi@gmail.com</Email>--}}
            {{--            </Contatti>--}}
        </CedentePrestatore>
        <CessionarioCommittente>
            <DatiAnagrafici>
                <IdFiscaleIVA>
                    <IdPaese>IT</IdPaese>
                    <IdCodice>{{ $sale->customer->tax_id_code }}</IdCodice>
                </IdFiscaleIVA>
                <CodiceFiscale>{{ $sale->customer->tax_id_code }}</CodiceFiscale>
                <Anagrafica>
                    <Nome>{{ $sale->customer->first_name }}</Nome>
                    <Cognome>{{ $sale->customer->last_name }}</Cognome>
                </Anagrafica>
            </DatiAnagrafici>
            <Sede>
                <Indirizzo>{{ $sale->customer->street . ', ' . $sale->customer->number }}</Indirizzo>
                <CAP>{{ $sale->customer->zip }}</CAP>
                <Comune>{{ $sale->customer->city }}</Comune>
                <Provincia>{{ $sale->customer->province }}</Provincia>
                <Nazione>{{ $sale->customer->country }}</Nazione>
            </Sede>
        </CessionarioCommittente>
        {{--        <TerzoIntermediarioOSoggettoEmittente>--}}
        {{--            <DatiAnagrafici>--}}
        {{--                <IdFiscaleIVA>--}}
        {{--                    <IdPaese>IT</IdPaese>--}}
        {{--                    <IdCodice>01713750931</IdCodice>--}}
        {{--                </IdFiscaleIVA>--}}
        {{--                <Anagrafica>--}}
        {{--                    <Denominazione>RDV Network s.r.l.</Denominazione>--}}
        {{--                </Anagrafica>--}}
        {{--            </DatiAnagrafici>--}}
        {{--        </TerzoIntermediarioOSoggettoEmittente>--}}
        {{--        <SoggettoEmittente>TZ</SoggettoEmittente>--}}
    </FatturaElettronicaHeader>
    <FatturaElettronicaBody>
        <DatiGenerali>
            <DatiGeneraliDocumento>
                <TipoDocumento>TD01</TipoDocumento>
                <Divisa>{{ $sale->currency }}</Divisa>
                <Data>{{ $sale->date->format('Y-m-d') }}</Data>
                <Numero>{{ $sale->progressive_number . '/' . $sale->year }}</Numero>
                <ImportoTotaleDocumento>{{ number_format($sale->total_price, 2) }}</ImportoTotaleDocumento>
            </DatiGeneraliDocumento>
        </DatiGenerali>
        <DatiBeniServizi>
            @foreach($sale->rows as $row)
                <DettaglioLinee>
                    <NumeroLinea>{{ $loop->iteration }}</NumeroLinea>
{{--                    <CodiceArticolo>--}}
{{--                        <CodiceTipo>Codice articolo</CodiceTipo>--}}
{{--                        <CodiceValore>{{ $item->code }}</CodiceValore>--}}
{{--                    </CodiceArticolo>--}}
                    <Descrizione>{{ $row->description }}</Descrizione>
                    <Quantita>{{ $row->quantity }}</Quantita>
{{--                    <UnitaMisura>{{ $row->unit }}</UnitaMisura>--}}
                    @if($row->start_date)
                        <DataInizioPeriodo>{{ $row->start_date->format('Y-m-d') }}</DataInizioPeriodo>
                    @endif
                    @if($row->end_date)
                        <DataFinePeriodo>{{ $row->end_date->format('Y-m-d') }}</DataFinePeriodo>
                    @endif
                    <PrezzoUnitario>{{ number_format($row->unit_price, 2) }}</PrezzoUnitario>
                    @if($row->percentage_discount > 0 || $row->absolute_discount > 0)
                        <ScontoMaggiorazione>
                            <Tipo>SC</Tipo>
                            <Percentuale>{{ number_format($row->percentage_discount, 2) }}</Percentuale>
                            <Importo>{{ number_format($row->absolute_discount, 2) }}</Importo>
                        </ScontoMaggiorazione>
                    @endif
                    <PrezzoTotale>{{ number_format($row->total, 2) }}</PrezzoTotale>
                    <AliquotaIVA>{{ number_format($row->vat_rate->percentage, 2) }}</AliquotaIVA>
                    @if($row->vat_rate->percentage === 0)
                        <Natura>{{ $row->vat_rate->nature }}</Natura>
                    @endif
                </DettaglioLinee>
            @endforeach
            @foreach($sale->summary_data as $tax)
                <DatiRiepilogo>
                    <AliquotaIVA>{{ $tax->vat_rate }}</AliquotaIVA>
                    <ImponibileImporto>{{ $tax->taxable_amount }}</ImponibileImporto>
                    <Imposta>{{ $tax->tax }}</Imposta>
                    <EsigibilitaIVA>{{ $tax->collectability_vat }}</EsigibilitaIVA>
                    @if($tax->vat_rate == 0.00)
                        <Natura>{{ $tax->nature }}</Natura>
                        <RiferimentoNormativo>{{ $tax->regulatory }}</RiferimentoNormativo>
                    @endif
                </DatiRiepilogo>
            @endforeach
        </DatiBeniServizi>
        @foreach($sale->payments as $payment)
            <DatiPagamento>
                <CondizioniPagamento>{{ count($sale->payments) > 1 ? 'TP01' : 'TP02' }}</CondizioniPagamento>
                <DettaglioPagamento>
                    <ModalitaPagamento>{{ $payment->payment_method->code }}</ModalitaPagamento>
                    <DataScadenzaPagamento>{{ $payment->due_date->format('Y-m-d') }}</DataScadenzaPagamento>
                    <ImportoPagamento>{{ number_format($payment->amount, '2') }}</ImportoPagamento>
                    @if($sale->financial_resource->type === 'bank')
                        <IstitutoFinanziario>{{ $sale->financial_resource->name }}</IstitutoFinanziario>
                        <IBAN>{{ $sale->financial_resource->iban }}</IBAN>
                    @endif
                </DettaglioPagamento>
            </DatiPagamento>
        @endforeach
    </FatturaElettronicaBody>
</b:FatturaElettronica>

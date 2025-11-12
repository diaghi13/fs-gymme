<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Fattura Elettronica {{ $sale->progressive_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
        }

        .container {
            padding: 20px;
        }

        h1 {
            font-size: 18pt;
            margin-bottom: 10px;
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header-info {
            margin-bottom: 20px;
            text-align: center;
            font-size: 9pt;
        }

        .section {
            margin-bottom: 15px;
            border: 1px solid #000;
            padding: 10px;
        }

        .section-title {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 8px;
            border-bottom: 1px solid #666;
            padding-bottom: 4px;
        }

        .grid {
            display: table;
            width: 100%;
        }

        .grid-row {
            display: table-row;
        }

        .grid-col {
            display: table-cell;
            padding: 4px;
            vertical-align: top;
        }

        .grid-col.label {
            font-weight: bold;
            width: 35%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table thead {
            background-color: #f0f0f0;
        }

        table th,
        table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
            font-size: 9pt;
        }

        table th {
            font-weight: bold;
        }

        table td.number {
            text-align: right;
        }

        table td.center {
            text-align: center;
        }

        .totals-section {
            margin-top: 20px;
        }

        .totals-table {
            width: 50%;
            margin-left: auto;
        }

        .totals-table td {
            padding: 6px;
        }

        .totals-table td.label {
            font-weight: bold;
            text-align: right;
            width: 60%;
        }

        .totals-table td.value {
            text-align: right;
            width: 40%;
        }

        .total-row {
            font-weight: bold;
            font-size: 11pt;
            background-color: #f0f0f0;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #000;
            font-size: 8pt;
            text-align: center;
            color: #666;
        }

        .two-columns {
            display: table;
            width: 100%;
        }

        .column {
            display: table-cell;
            width: 48%;
            padding: 0 1%;
        }
    </style>
</head>
<body>
    <div class="container">
        {{-- Intestazione --}}
        <h1>FATTURA ELETTRONICA</h1>

        <div class="header-info">
            <strong>{{ $sale->documentType?->name ?? 'Fattura' }}</strong><br>
            N. {{ $sale->progressive_number }} del {{ $sale->date->format('d/m/Y') }}<br>
            @if($sale->electronic_invoice)
                Progressivo Invio: {{ $sale->electronic_invoice->transmission_id }}
            @endif
        </div>

        {{-- Cedente/Prestatore e Cessionario/Committente --}}
        <div class="two-columns">
            {{-- Cedente/Prestatore --}}
            <div class="column">
                <div class="section">
                    <div class="section-title">CEDENTE/PRESTATORE</div>
                    <div class="grid">
                        @if($tenant->company_name)
                            <div class="grid-row">
                                <div class="grid-col label">Denominazione:</div>
                                <div class="grid-col">{{ $tenant->company_name }}</div>
                            </div>
                        @endif

                        @if($tenant->vat_number)
                            <div class="grid-row">
                                <div class="grid-col label">Partita IVA:</div>
                                <div class="grid-col">IT{{ $tenant->vat_number }}</div>
                            </div>
                        @endif

                        @if($tenant->tax_code)
                            <div class="grid-row">
                                <div class="grid-col label">Codice Fiscale:</div>
                                <div class="grid-col">{{ $tenant->tax_code }}</div>
                            </div>
                        @endif

                        <div class="grid-row">
                            <div class="grid-col label">Indirizzo:</div>
                            <div class="grid-col">
                                {{ $tenant->address }}<br>
                                {{ $tenant->postal_code }} {{ $tenant->city }} ({{ $tenant->province }})
                            </div>
                        </div>

                        @if($tenant->pec_email)
                            <div class="grid-row">
                                <div class="grid-col label">PEC:</div>
                                <div class="grid-col">{{ $tenant->pec_email }}</div>
                            </div>
                        @endif

                        @if($tenant->fiscal_regime)
                            <div class="grid-row">
                                <div class="grid-col label">Regime Fiscale:</div>
                                <div class="grid-col">{{ $tenant->fiscal_regime }}</div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            {{-- Cessionario/Committente --}}
            <div class="column">
                <div class="section">
                    <div class="section-title">CESSIONARIO/COMMITTENTE</div>
                    <div class="grid">
                        <div class="grid-row">
                            <div class="grid-col label">
                                @if($sale->customer->company_name)
                                    Denominazione:
                                @else
                                    Nome:
                                @endif
                            </div>
                            <div class="grid-col">
                                @if($sale->customer->company_name)
                                    {{ $sale->customer->company_name }}
                                @else
                                    {{ $sale->customer->first_name }} {{ $sale->customer->last_name }}
                                @endif
                            </div>
                        </div>

                        @if($sale->customer->vat_number)
                            <div class="grid-row">
                                <div class="grid-col label">Partita IVA:</div>
                                <div class="grid-col">IT{{ $sale->customer->vat_number }}</div>
                            </div>
                        @endif

                        @if($sale->customer->tax_code ?? $sale->customer->tax_id_code)
                            <div class="grid-row">
                                <div class="grid-col label">Codice Fiscale:</div>
                                <div class="grid-col">{{ $sale->customer->tax_code ?? $sale->customer->tax_id_code }}</div>
                            </div>
                        @endif

                        <div class="grid-row">
                            <div class="grid-col label">Indirizzo:</div>
                            <div class="grid-col">
                                {{ $sale->customer->street ?? $sale->customer->address }}<br>
                                {{ $sale->customer->zip ?? $sale->customer->postal_code }}
                                {{ $sale->customer->city }}
                                @if($sale->customer->province)
                                    ({{ $sale->customer->province }})
                                @endif
                            </div>
                        </div>

                        @if($sale->customer->email)
                            <div class="grid-row">
                                <div class="grid-col label">Email:</div>
                                <div class="grid-col">{{ $sale->customer->email }}</div>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        {{-- Righe Documento --}}
        <div class="section">
            <div class="section-title">DETTAGLIO RIGHE</div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 5%">#</th>
                        <th style="width: 35%">Descrizione</th>
                        <th style="width: 10%" class="center">Quantità</th>
                        <th style="width: 10%" class="center">U.M.</th>
                        <th style="width: 12%" class="number">Prezzo Unit.</th>
                        <th style="width: 10%" class="center">Sconto</th>
                        <th style="width: 8%" class="center">IVA %</th>
                        <th style="width: 10%" class="number">Totale</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($sale->saleRows as $index => $row)
                        <tr>
                            <td class="center">{{ $index + 1 }}</td>
                            <td>{{ $row->description }}</td>
                            <td class="center">{{ number_format($row->quantity, 2, ',', '.') }}</td>
                            <td class="center">{{ $row->unit_measure ?? 'pz' }}</td>
                            <td class="number">€ {{ number_format($row->unit_price, 2, ',', '.') }}</td>
                            <td class="center">
                                @if($row->percentage_discount)
                                    {{ number_format($row->percentage_discount, 2, ',', '.') }}%
                                @elseif($row->absolute_discount)
                                    € {{ number_format($row->absolute_discount, 2, ',', '.') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="center">{{ $row->vatRate?->percentage ?? 0 }}%</td>
                            <td class="number">€ {{ number_format($row->total_price, 2, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- Riepilogo IVA --}}
        <div class="section">
            <div class="section-title">RIEPILOGO IVA</div>

            <table style="width: 70%">
                <thead>
                    <tr>
                        <th style="width: 20%" class="center">Aliquota IVA</th>
                        <th style="width: 30%" class="number">Imponibile</th>
                        <th style="width: 20%" class="number">Imposta</th>
                        <th style="width: 30%" class="number">Totale</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $vatBreakdown = [];
                        foreach($sale->saleRows as $row) {
                            $vatRate = $row->vatRate?->percentage ?? 0;
                            if (!isset($vatBreakdown[$vatRate])) {
                                $vatBreakdown[$vatRate] = [
                                    'taxable' => 0,
                                    'tax' => 0,
                                ];
                            }

                            $rowTotal = $row->total_price;
                            if ($sale->tax_included) {
                                $taxable = $rowTotal / (1 + ($vatRate / 100));
                                $tax = $rowTotal - $taxable;
                            } else {
                                $taxable = $rowTotal;
                                $tax = $rowTotal * ($vatRate / 100);
                            }

                            $vatBreakdown[$vatRate]['taxable'] += $taxable;
                            $vatBreakdown[$vatRate]['tax'] += $tax;
                        }
                        ksort($vatBreakdown);
                    @endphp

                    @foreach($vatBreakdown as $rate => $amounts)
                        <tr>
                            <td class="center">{{ number_format($rate, 0) }}%</td>
                            <td class="number">€ {{ number_format($amounts['taxable'], 2, ',', '.') }}</td>
                            <td class="number">€ {{ number_format($amounts['tax'], 2, ',', '.') }}</td>
                            <td class="number">€ {{ number_format($amounts['taxable'] + $amounts['tax'], 2, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- Totali Documento --}}
        <div class="totals-section">
            <table class="totals-table">
                @php
                    $subtotal = array_sum(array_column($vatBreakdown, 'taxable'));
                    $totalTax = array_sum(array_column($vatBreakdown, 'tax'));
                    $grossTotal = $subtotal + $totalTax;
                @endphp

                <tr>
                    <td class="label">Totale Imponibile:</td>
                    <td class="value">€ {{ number_format($subtotal, 2, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="label">Totale IVA:</td>
                    <td class="value">€ {{ number_format($totalTax, 2, ',', '.') }}</td>
                </tr>

                @if($sale->discount_percentage || $sale->discount_absolute)
                    <tr>
                        <td class="label">Sconto Generale:</td>
                        <td class="value">
                            @if($sale->discount_percentage)
                                {{ number_format($sale->discount_percentage, 2, ',', '.') }}%
                            @else
                                € {{ number_format($sale->discount_absolute, 2, ',', '.') }}
                            @endif
                        </td>
                    </tr>
                @endif

                @if($sale->withholding_tax_amount)
                    <tr>
                        <td class="label">Ritenuta d'Acconto ({{ number_format($sale->withholding_tax_rate, 0) }}%):</td>
                        <td class="value">- € {{ number_format($sale->withholding_tax_amount, 2, ',', '.') }}</td>
                    </tr>
                @endif

                @if($sale->welfare_fund_amount)
                    <tr>
                        <td class="label">Contributo Cassa ({{ number_format($sale->welfare_fund_rate, 2) }}%):</td>
                        <td class="value">€ {{ number_format($sale->welfare_fund_amount, 2, ',', '.') }}</td>
                    </tr>
                @endif

                @if($sale->stamp_duty_applied && $sale->stamp_duty_amount)
                    <tr>
                        <td class="label">Imposta di Bollo:</td>
                        <td class="value">€ {{ number_format($sale->stamp_duty_amount, 2, ',', '.') }}</td>
                    </tr>
                @endif

                <tr class="total-row">
                    <td class="label">TOTALE DOCUMENTO:</td>
                    <td class="value">
                        € {{ number_format($sale->summary['total'], 2, ',', '.') }}
                    </td>
                </tr>
            </table>
        </div>

        {{-- Note e Causale --}}
        @if($sale->notes || $sale->causale)
            <div class="section">
                <div class="section-title">NOTE</div>
                @if($sale->causale)
                    <p><strong>Causale:</strong> {{ $sale->causale }}</p>
                @endif
                @if($sale->notes)
                    <p>{{ $sale->notes }}</p>
                @endif
            </div>
        @endif

        {{-- Modalità di Pagamento --}}
        @if($sale->paymentCondition || $sale->financialResource)
            <div class="section">
                <div class="section-title">MODALITÀ DI PAGAMENTO</div>
                <div class="grid">
                    @if($sale->paymentCondition)
                        <div class="grid-row">
                            <div class="grid-col label">Condizioni:</div>
                            <div class="grid-col">{{ $sale->paymentCondition->name }}</div>
                        </div>
                    @endif
                    @if($sale->financialResource)
                        <div class="grid-row">
                            <div class="grid-col label">Metodo:</div>
                            <div class="grid-col">{{ $sale->financialResource->name }}</div>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        {{-- Footer --}}
        <div class="footer">
            <p>Documento emesso in formato elettronico ai sensi dell'art. 21 del D.P.R. n. 633/1972</p>
            @if($sale->electronic_invoice)
                <p>Trasmesso al Sistema di Interscambio in data {{ $sale->electronic_invoice->sdi_sent_at?->format('d/m/Y H:i') ?? 'N/D' }}</p>
            @endif
            <p style="margin-top: 10px">Generato il {{ now()->format('d/m/Y H:i') }}</p>
        </div>
    </div>
</body>
</html>

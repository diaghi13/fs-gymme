<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Fattura n. {{ $sale->progressive_number }}</title>
    <style>
        @page { margin: 30px 40px; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            color: #000;
            min-height: 100vh;
            position: relative;
        }

        .main {
            min-height: calc(100vh - 200px);
            position: relative;
        }

        .content-wrapper {
            min-height: calc(100vh - 300px);
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header table {
            width: 100%;
            border: none;
            margin: 0;
        }

        .header td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .header-left img {
            max-height: 60px;
        }

        .header-left h2 {
            font-size: 14pt;
            color: #1976d2;
            margin: 0;
        }

        .header-right {
            text-align: right;
            font-size: 9pt;
        }

        .header-right h2 {
            font-size: 12pt;
            color: #1976d2;
            margin: 0;
        }

        .two-columns {
            width: 100%;
            margin-bottom: 20px;
        }

        .two-columns table {
            width: 100%;
            border: none;
            margin: 0;
        }

        .two-columns td {
            width: 50%;
            vertical-align: top;
            padding: 10px;
            border: none;
        }

        .section-title {
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 5px;
            font-size: 10pt;
            border-bottom: 1px solid #ddd;
            padding-bottom: 2px;
            width: 100%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 8.5pt;
        }

        th, td {
            padding: 5px;
            border-bottom: 1px solid #e0e0e0;
        }

        th {
            text-align: left;
            color: #1976d2;
        }

        td.number, th.number { text-align: right; }
        td.center { text-align: center; }

        .summary {
            width: 100%;
            margin-top: 20px;
        }

        .summary > table {
            width: 100%;
            border: none;
        }

        .summary > table > tbody > tr > td {
            width: 50%;
            vertical-align: top;
            padding: 10px;
            border: none;
        }

        .summary table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
        }

        .summary table table th,
        .summary table table td {
            padding: 5px;
            border-bottom: 1px solid #e0e0e0;
        }

        .section {
            width: 100%;
            margin-top: 15px;
        }

        .totals {
            width: 100%;
        }

        .totals td.label {
            text-align: right;
            font-weight: bold;
            padding-right: 10px;
        }

        .totals td.value {
            text-align: right;
        }

        .totals .total {
            font-weight: bold;
            font-size: 11pt;
            color: #1976d2;
            border-top: 2px solid #1976d2;
        }

        .footer {
            font-size: 8pt;
            color: #555;
            border-top: 1px solid #e0e0e0;
            margin-top: 20px;
            padding-top: 10px;
            text-align: center;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
        }

    </style>
</head>
<body>

{{-- HEADER --}}
<div class="header">
    <table>
        <tr>
            <td style="width: 50%;" class="header-left">
                @if($tenant->logo_url ?? false)
                    <img src="{{ $tenant->logo_url }}" alt="Logo azienda">
                @else
                    <h2>{{ $tenant->company_name ?? 'Nome Azienda' }}</h2>
                @endif
            </td>
            <td style="width: 50%;" class="header-right">
                <h2>FATTURA n. {{ $sale->progressive_number }}</h2>
                <p>del {{ $sale->date->format('d/m/Y') }}</p>
                @if($sale->electronic_invoice)
                    <small>Progressivo Invio: {{ $sale->electronic_invoice->transmission_id }}</small>
                @endif
                <div style="margin-top:5px;">
                    {{ $tenant->address }}<br>
                    {{ $tenant->postal_code }} {{ $tenant->city }} ({{ $tenant->province }})<br>
                    P.IVA {{ $tenant->vat_number }} - C.F. {{ $tenant->tax_code }}<br>
                    @if($tenant->pec_email)
                        PEC: {{ $tenant->pec_email }}
                    @endif
                </div>
            </td>
        </tr>
    </table>
</div>

<div class="main">
    <div class="content-wrapper">

    {{-- CLIENTE e AZIENDA --}}
    <div class="two-columns">
        <table>
            <tr>
                <td>
                    <div class="section-title">CESSIONARIO / COMMITTENTE</div>
                    <div>
                        @if($sale->customer->company_name)
                            <strong>{{ $sale->customer->company_name }}</strong><br>
                        @else
                            <strong>{{ $sale->customer->first_name }} {{ $sale->customer->last_name }}</strong><br>
                        @endif
                        @if($sale->customer->vat_number)
                            P.IVA: IT{{ $sale->customer->vat_number }}<br>
                        @endif
                        @if($sale->customer->tax_code)
                            C.F.: {{ $sale->customer->tax_code }}<br>
                        @endif
                        {{ $sale->customer->street ?? $sale->customer->address }}
                        @if($sale->customer->number)
                            {{ $sale->customer->number }}
                        @endif
                        <br>
                        {{ $sale->customer->zip ?? $sale->customer->postal_code }} {{ $sale->customer->city }}
                        @if($sale->customer->province)
                            ({{ $sale->customer->province }})
                        @endif
                    </div>
                </td>
                <td>
                    <div class="section-title">CEDENTE / PRESTATORE</div>
                    <div>
                        <strong>{{ $tenant->company_name }}</strong><br>
                        P.IVA: IT{{ $tenant->vat_number }}<br>
                        C.F.: {{ $tenant->tax_code }}<br>
                        {{ $tenant->address }}, {{ $tenant->postal_code }} {{ $tenant->city }} ({{ $tenant->province }})
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- RIGHE DOCUMENTO --}}
    <table>
        <thead>
        <tr>
            <th style="width:5%">#</th>
            <th style="width:35%">Descrizione</th>
            <th style="width:10%" class="center">Quantità</th>
            <th style="width:10%" class="center">U.M.</th>
            <th style="width:12%" class="number">Prezzo Unit.</th>
            <th style="width:10%" class="center">Sconto</th>
            <th style="width:8%" class="center">IVA</th>
            <th style="width:10%" class="number">Totale</th>
        </tr>
        </thead>
        <tbody>
        @foreach($sale->rows as $index => $row)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td>{{ $row->description }}</td>
                <td class="center">{{ number_format($row->quantity, 2, ',', '.') }}</td>
                <td class="center">{{ $row->unit_measure ?? 'pz' }}</td>
                <td class="number">€ {{ number_format($row->unit_price_net, 2, ',', '.') }}</td>
                <td class="center">
                    @if($row->percentage_discount)
                        {{ number_format($row->percentage_discount, 2, ',', '.') }}%
                    @elseif($row->absolute_discount)
                        € {{ number_format($row->absolute_discount, 2, ',', '.') }}
                    @else
                        —
                    @endif
                </td>
                <td class="center">{{ $row->vat_rate?->percentage ?? 0 }}%</td>
                <td class="number">€ {{ number_format($row->total_gross, 2, ',', '.') }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    </div>{{-- Fine content-wrapper --}}

    {{-- RIEPILOGO IVA + TOTALI --}}
    @php
        $vatBreakdown = [];
        foreach($sale->rows as $row) {
            $rate = $row->vat_rate?->percentage ?? 0;
            $nature = $row->vat_rate?->nature ?? null;
            $description = $row->vat_rate?->description ?? null;

            $key = $rate;
            if ($nature) {
                $key = $rate . '_' . $nature;
            }

            if (!isset($vatBreakdown[$key])) {
                $vatBreakdown[$key] = [
                    'rate' => $rate,
                    'nature' => $nature,
                    'description' => $description,
                    'taxable' => 0,
                    'tax' => 0,
                ];
            }

            $vatBreakdown[$key]['taxable'] += $row->total_net;
            $vatBreakdown[$key]['tax'] += $row->vat_amount;
        }
        $subtotal = array_sum(array_column($vatBreakdown, 'taxable'));
        $totalTax = array_sum(array_column($vatBreakdown, 'tax'));
        $grossTotal = $subtotal + $totalTax;
    @endphp

    <div class="summary">
        <table>
            <tr>
                <td>
                    {{-- RIEPILOGO IVA --}}
                    <div class="section-title">RIEPILOGO IVA</div>
                    <table>
                        <thead>
                        <tr>
                            <th>Aliquota</th>
                            <th class="number">Imponibile</th>
                            <th class="number">Imposta</th>
                            <th class="number">Totale</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($vatBreakdown as $key => $v)
                            <tr>
                                <td>
                                    {{ $v['rate'] }}%
                                    @if($v['nature'])
                                        <br><small style="font-size: 7pt;">({{ $v['nature'] }})</small>
                                    @endif
                                </td>
                                <td class="number">€ {{ number_format($v['taxable'], 2, ',', '.') }}</td>
                                <td class="number">€ {{ number_format($v['tax'], 2, ',', '.') }}</td>
                                <td class="number">€ {{ number_format($v['taxable'] + $v['tax'], 2, ',', '.') }}</td>
                            </tr>
                            @if($v['nature'] && $v['description'])
                                <tr>
                                    <td colspan="4" style="font-size: 7pt; padding: 2px 6px; border-top: none;">
                                        <em>{{ $v['description'] }}</em>
                                    </td>
                                </tr>
                            @endif
                        @endforeach
                        </tbody>
                    </table>
                </td>
                <td>
                    {{-- TOTALI --}}
                    <div class="section-title">TOTALI</div>
                    <table class="totals">
                        <tr>
                            <td class="label">Totale Imponibile:</td>
                            <td class="value">€ {{ number_format($subtotal, 2, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td class="label">Totale IVA:</td>
                            <td class="value">€ {{ number_format($totalTax, 2, ',', '.') }}</td>
                        </tr>
                        @if($sale->stamp_duty_applied && $sale->stamp_duty_amount)
                            <tr>
                                <td class="label">Imposta di Bollo:</td>
                                <td class="value">€ {{ number_format($sale->stamp_duty_amount, 2, ',', '.') }}</td>
                            </tr>
                            @php $grossTotal += $sale->stamp_duty_amount; @endphp
                        @endif
                        <tr class="total">
                            <td class="label">TOTALE FATTURA:</td>
                            <td class="value">€ {{ number_format($grossTotal, 2, ',', '.') }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    {{-- PAGAMENTI --}}
    @if($sale->payments->isNotEmpty())
        <div class="section" style="margin-top: 20px;">
            <div class="section-title">MODALITÀ DI PAGAMENTO</div>
            @foreach($sale->payments as $p)
                <p style="font-size:8.5pt; margin: 2px 0;">
                    Scadenza {{ \Illuminate\Support\Carbon::parse($p->due_date)->format('d/m/Y') }}:
                    € {{ number_format($p->amount, 2, ',', '.') }}
                    @if($p->payment_method)
                        ({{ $p->payment_method->description }})
                    @endif
                    @if($p->is_payed)
                        <strong style="color: green;"> - PAGATO</strong>
                    @endif
                </p>
            @endforeach
        </div>
    @endif

</div>

{{-- FOOTER --}}
<div class="footer">
    Documento emesso ai sensi dell'art. 21 DPR 633/1972<br>
    Generato il {{ now()->format('d/m/Y H:i') }}
</div>

</body>
</html>


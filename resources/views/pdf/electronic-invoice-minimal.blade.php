<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Fattura n. {{ $sale->progressive_number }}</title>
    <style>
        @page {
            margin: 40px 50px;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            color: #000;
            line-height: 1.4;
        }

        .page-wrapper {
            width: 100%;
        }

        /* Minimal Header */
        .header {
            margin-bottom: 40px;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
        }

        .header img {
            max-height: 50px;
            margin-bottom: 5px;
        }

        .header h1 {
            font-size: 18pt;
            font-weight: normal;
            margin: 0 0 5px 0;
            letter-spacing: 1pt;
        }

        .header-info {
            font-size: 8pt;
            margin-top: 5px;
        }

        /* Info Blocks */
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }

        .info-block {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 20px;
        }

        .info-title {
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 1pt;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .info-content {
            font-size: 8.5pt;
            line-height: 1.5;
        }

        /* Minimal Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 8pt;
        }

        th {
            text-align: left;
            padding: 8px 5px;
            border-bottom: 2px solid #000;
            font-weight: bold;
            font-size: 7.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }

        td {
            padding: 8px 5px;
            border-bottom: 1px solid #ddd;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        th.number, td.number {
            text-align: right;
        }

        td.center {
            text-align: center;
        }

        /* Summary */
        .summary-section {
            display: table;
            width: 100%;
            margin-top: 30px;
        }

        .summary-block {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 10px;
        }

        .summary-title {
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 1pt;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .summary-table {
            width: 100%;
            font-size: 8pt;
        }

        .summary-table th {
            border-bottom: 1px solid #000;
            font-size: 7pt;
        }

        .summary-table td {
            padding: 5px;
            border-bottom: 1px solid #eee;
        }

        /* Totals */
        .totals-table {
            width: 100%;
            margin-top: 10px;
        }

        .totals-table td {
            border: none;
            padding: 5px 0;
        }

        .totals-table td.label {
            text-align: right;
            padding-right: 15px;
            width: 70%;
            font-size: 8pt;
        }

        .totals-table td.value {
            text-align: right;
            font-weight: bold;
            width: 30%;
            font-size: 9pt;
        }

        .totals-table tr.total {
            border-top: 2px solid #000;
        }

        .totals-table tr.total td {
            padding-top: 10px;
            font-size: 12pt;
            font-weight: bold;
        }

        /* Payments */
        .payments {
            margin-top: 25px;
            padding: 15px 0;
            border-top: 1px solid #000;
        }

        .payments .summary-title {
            margin-bottom: 8px;
        }

        .payments p {
            margin: 3px 0;
            font-size: 8pt;
        }

        /* Footer */
        .footer {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 1px solid #000;
            font-size: 7pt;
            text-align: center;
            line-height: 1.5;
        }

    </style>
</head>
<body>

<div class="page-wrapper">

    {{-- MINIMAL HEADER --}}
    <div class="header">
        @if(isset($pdfSettings['logo_path']) && $pdfSettings['logo_path'])
            <img src="{{ storage_path('app/' . $pdfSettings['logo_path']) }}" alt="Logo">
        @elseif($tenant->logo_url ?? false)
            <img src="{{ $tenant->logo_url }}" alt="Logo">
        @else
            <h1>{{ $tenant->name ?? 'Nome Azienda' }}</h1>
        @endif
        <h1>FATTURA {{ $sale->progressive_number }}</h1>
        <div class="header-info">
            {{ $sale->date->format('d/m/Y') }}
            @if($sale->electronic_invoice)
                — SDI: {{ $sale->electronic_invoice->transmission_id }}
            @endif
        </div>
    </div>

    {{-- INFO BLOCKS --}}
    <div class="info-grid">
        <div class="info-block">
            <div class="info-title">Da</div>
            <div class="info-content">
                <strong>{{ $tenant->company_name }}</strong><br>
                {{ $tenant->address }}<br>
                {{ $tenant->postal_code }} {{ $tenant->city }} ({{ $tenant->province }})<br>
                P.IVA IT{{ $tenant->vat_number }} — C.F. {{ $tenant->tax_code }}
                @if($tenant->pec_email)
                    <br>PEC: {{ $tenant->pec_email }}
                @endif
            </div>
        </div>
        <div class="info-block">
            <div class="info-title">A</div>
            <div class="info-content">
                @if($sale->customer->company_name)
                    <strong>{{ $sale->customer->company_name }}</strong><br>
                @else
                    <strong>{{ $sale->customer->first_name }} {{ $sale->customer->last_name }}</strong><br>
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
                <br>
                @if($sale->customer->vat_number)
                    P.IVA IT{{ $sale->customer->vat_number }}
                @endif
                @if($sale->customer->tax_code)
                    @if($sale->customer->vat_number) — @endif
                    C.F. {{ $sale->customer->tax_code }}
                @endif
            </div>
        </div>
    </div>

    {{-- ITEMS TABLE --}}
    <table>
        <thead>
        <tr>
            <th style="width:5%">#</th>
            <th style="width:40%">Descrizione</th>
            <th style="width:10%" class="center">Qta</th>
            <th style="width:8%" class="center">UM</th>
            <th style="width:12%" class="number">Prezzo</th>
            <th style="width:8%" class="center">Sconto</th>
            <th style="width:7%" class="center">IVA</th>
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
                <td class="number">{{ number_format($row->unit_price_net, 2, ',', '.') }}</td>
                <td class="center">
                    @if($row->percentage_discount)
                        {{ number_format($row->percentage_discount, 2, ',', '.') }}%
                    @elseif($row->absolute_discount)
                        {{ number_format($row->absolute_discount, 2, ',', '.') }}
                    @else
                        —
                    @endif
                </td>
                <td class="center">{{ $row->vat_rate?->percentage ?? 0 }}%</td>
                <td class="number">{{ number_format($row->total_gross, 2, ',', '.') }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    {{-- VAT BREAKDOWN + TOTALS --}}
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

    <div class="summary-section">
        <div class="summary-block">
            <div class="summary-title">Riepilogo IVA</div>
            <table class="summary-table">
                <thead>
                <tr>
                    <th>Aliquota</th>
                    <th class="number">Imponibile</th>
                    <th class="number">Imposta</th>
                </tr>
                </thead>
                <tbody>
                @foreach($vatBreakdown as $key => $v)
                    <tr>
                        <td>
                            {{ $v['rate'] }}%
                            @if($v['nature'])
                                ({{ $v['nature'] }})
                            @endif
                        </td>
                        <td class="number">{{ number_format($v['taxable'], 2, ',', '.') }}</td>
                        <td class="number">{{ number_format($v['tax'], 2, ',', '.') }}</td>
                    </tr>
                    @if($v['nature'] && $v['description'])
                        <tr>
                            <td colspan="3" style="font-size: 6.5pt; padding: 2px 5px; border-bottom: none;">
                                {{ $v['description'] }}
                            </td>
                        </tr>
                    @endif
                @endforeach
                </tbody>
            </table>
        </div>

        <div class="summary-block">
            <div class="summary-title">Totale</div>
            <table class="totals-table">
                <tr>
                    <td class="label">Imponibile</td>
                    <td class="value">€ {{ number_format($subtotal, 2, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="label">IVA</td>
                    <td class="value">€ {{ number_format($totalTax, 2, ',', '.') }}</td>
                </tr>
                @if($sale->stamp_duty_applied && $sale->stamp_duty_amount && ($pdfSettings['show_stamp'] ?? true))
                    <tr>
                        <td class="label">Bollo</td>
                        <td class="value">€ {{ number_format($sale->stamp_duty_amount, 2, ',', '.') }}</td>
                    </tr>
                    @php $grossTotal += $sale->stamp_duty_amount; @endphp
                @endif
                <tr class="total">
                    <td class="label">TOTALE</td>
                    <td class="value">€ {{ number_format($grossTotal, 2, ',', '.') }}</td>
                </tr>
            </table>
        </div>
    </div>

    {{-- PAYMENTS --}}
    @if($sale->payments->isNotEmpty())
        <div class="payments">
            <div class="summary-title">Pagamenti</div>
            @foreach($sale->payments as $p)
                <p>
                    {{ \Illuminate\Support\Carbon::parse($p->due_date)->format('d/m/Y') }}:
                    € {{ number_format($p->amount, 2, ',', '.') }}
                    @if($p->payment_method)
                        ({{ $p->payment_method->description }})
                    @endif
                    @if($p->is_payed)
                        <strong>— PAGATO</strong>
                    @endif
                </p>
            @endforeach
        </div>
    @endif

    {{-- FOOTER --}}
    <div class="footer">
        @if(isset($pdfSettings['footer']) && $pdfSettings['footer'])
            {!! nl2br(e($pdfSettings['footer'])) !!}
            <br><br>
        @endif

        @if(isset($pdfSettings['legal_notes']) && $pdfSettings['legal_notes'])
            {!! nl2br(e($pdfSettings['legal_notes'])) !!}
            <br><br>
        @endif

        Documento emesso ai sensi dell'art. 21 DPR 633/1972 — Generato il {{ now()->format('d/m/Y H:i') }}
    </div>

</div>

</body>
</html>

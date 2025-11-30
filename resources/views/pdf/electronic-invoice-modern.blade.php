<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Fattura n. {{ $sale->progressive_number }}</title>
    <style>
        @page {
            margin: 25px 35px;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9.5pt;
            color: #2c3e50;
            line-height: 1.6;
        }

        .page-wrapper {
            width: 100%;
        }

        /* Modern Header with centered logo */
        .header {
            text-align: center;
            padding-bottom: 20px;
            margin-bottom: 30px;
            border-bottom: 3px solid #3498db;
        }

        .header img {
            max-height: 70px;
            margin-bottom: 10px;
        }

        .header h2 {
            font-size: 16pt;
            color: #3498db;
            margin: 5px 0;
            font-weight: 600;
        }

        .header-info {
            font-size: 9pt;
            color: #7f8c8d;
            margin-top: 8px;
        }

        /* Info Cards */
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 25px;
        }

        .info-card {
            display: table-cell;
            width: 48%;
            background: #f8f9fa;
            border-radius: 4px;
            padding: 15px;
            vertical-align: top;
        }

        .info-card + .info-card {
            padding-left: 4%;
        }

        .card-title {
            font-size: 10pt;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }

        .card-content {
            font-size: 9pt;
            line-height: 1.7;
        }

        /* Modern Table */
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 20px;
            font-size: 9pt;
        }

        th {
            background: #3498db;
            color: white;
            text-align: left;
            padding: 10px 8px;
            font-weight: 600;
            font-size: 9pt;
        }

        th:first-child {
            border-radius: 4px 0 0 0;
        }

        th:last-child {
            border-radius: 0 4px 0 0;
        }

        td {
            padding: 10px 8px;
            border-bottom: 1px solid #ecf0f1;
        }

        tbody tr:hover {
            background-color: #f8f9fa;
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

        /* Summary Section */
        .summary-wrapper {
            display: table;
            width: 100%;
            margin-top: 35px;
        }

        .summary-col {
            display: table-cell;
            width: 48%;
            vertical-align: top;
            padding: 15px;
        }

        .summary-col + .summary-col {
            padding-left: 4%;
        }

        .summary-box {
            background: #f8f9fa;
            border-radius: 4px;
            padding: 15px;
        }

        .summary-title {
            font-size: 10pt;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }

        .summary-box table {
            margin-top: 0;
            font-size: 8.5pt;
        }

        .summary-box th {
            background: #ecf0f1;
            color: #2c3e50;
            padding: 6px 8px;
        }

        .summary-box td {
            padding: 6px 8px;
        }

        /* Totals */
        .totals-box {
            background: #3498db;
            color: white;
            border-radius: 4px;
            padding: 20px;
        }

        .totals-box .summary-title {
            color: white;
        }

        .totals {
            width: 100%;
        }

        .totals td {
            border: none !important;
            padding: 8px 0;
            color: white;
        }

        .totals td.label {
            text-align: right;
            font-weight: normal;
            padding-right: 20px;
            width: 60%;
            font-size: 9pt;
        }

        .totals td.value {
            text-align: right;
            font-weight: 600;
            width: 40%;
            font-size: 10pt;
        }

        .totals tr.total td {
            padding-top: 15px;
            border-top: 2px solid rgba(255,255,255,0.3) !important;
            font-size: 14pt;
            font-weight: bold;
        }

        /* Payments */
        .payments-wrapper {
            background: #e8f4f8;
            border-left: 4px solid #3498db;
            padding: 15px 20px;
            margin-top: 25px;
            border-radius: 0 4px 4px 0;
        }

        .payments-wrapper .summary-title {
            font-size: 10pt;
            margin-bottom: 10px;
        }

        .payments-wrapper p {
            margin: 5px 0;
            font-size: 9pt;
        }

        /* Footer */
        .footer {
            margin-top: 35px;
            padding-top: 15px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            font-size: 8pt;
            color: #7f8c8d;
            line-height: 1.6;
        }

    </style>
</head>
<body>

<div class="page-wrapper">

    {{-- MODERN HEADER --}}
    <div class="header">
        @if(isset($pdfSettings['logo_path']) && $pdfSettings['logo_path'])
            <img src="{{ storage_path('app/' . $pdfSettings['logo_path']) }}" alt="Logo azienda">
        @elseif($tenant->logo_url ?? false)
            <img src="{{ $tenant->logo_url }}" alt="Logo azienda">
        @else
            <h2 style="margin-bottom: 0;">{{ $tenant->name ?? 'Nome Azienda' }}</h2>
        @endif
        <h2>FATTURA n. {{ $sale->progressive_number }}</h2>
        <div class="header-info">
            Data: {{ $sale->date->format('d/m/Y') }}
            @if($sale->electronic_invoice)
                | Progressivo SDI: {{ $sale->electronic_invoice->transmission_id }}
            @endif
        </div>
    </div>

    {{-- INFO CARDS --}}
    <div class="info-section">
        <div class="info-card">
            <div class="card-title">Cessionario / Committente</div>
            <div class="card-content">
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
        </div>
        <div class="info-card">
            <div class="card-title">Cedente / Prestatore</div>
            <div class="card-content">
                <strong>{{ $tenant->company_name }}</strong><br>
                P.IVA: IT{{ $tenant->vat_number }}<br>
                C.F.: {{ $tenant->tax_code }}<br>
                {{ $tenant->address }}, {{ $tenant->postal_code }} {{ $tenant->city }} ({{ $tenant->province }})<br>
                @if($tenant->pec_email)
                    PEC: {{ $tenant->pec_email }}
                @endif
            </div>
        </div>
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

    <div class="summary-wrapper">
        <div class="summary-col">
            {{-- RIEPILOGO IVA --}}
            <div class="summary-box">
                <div class="summary-title">Riepilogo IVA</div>
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
                                    <br><small style="font-size: 7pt; color: #7f8c8d;">({{ $v['nature'] }})</small>
                                @endif
                            </td>
                            <td class="number">€ {{ number_format($v['taxable'], 2, ',', '.') }}</td>
                            <td class="number">€ {{ number_format($v['tax'], 2, ',', '.') }}</td>
                            <td class="number">€ {{ number_format($v['taxable'] + $v['tax'], 2, ',', '.') }}</td>
                        </tr>
                        @if($v['nature'] && $v['description'])
                            <tr>
                                <td colspan="4" style="font-size: 7pt; padding: 2px 8px; border-bottom: none; color: #7f8c8d;">
                                    <em>{{ $v['description'] }}</em>
                                </td>
                            </tr>
                        @endif
                    @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        <div class="summary-col">
            {{-- TOTALI DOCUMENTO --}}
            <div class="totals-box">
                <div class="summary-title">Totali Documento</div>
                <table class="totals">
                    <tr>
                        <td class="label">Totale Imponibile:</td>
                        <td class="value">€ {{ number_format($subtotal, 2, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <td class="label">Totale IVA:</td>
                        <td class="value">€ {{ number_format($totalTax, 2, ',', '.') }}</td>
                    </tr>
                    @if($sale->stamp_duty_applied && $sale->stamp_duty_amount && ($pdfSettings['show_stamp'] ?? true))
                        <tr>
                            <td class="label">Imposta di Bollo:</td>
                            <td class="value">€ {{ number_format($sale->stamp_duty_amount, 2, ',', '.') }}</td>
                        </tr>
                        @php $grossTotal += $sale->stamp_duty_amount; @endphp
                    @endif
                    <tr class="total">
                        <td class="label">TOTALE:</td>
                        <td class="value">€ {{ number_format($grossTotal, 2, ',', '.') }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>

    {{-- PAGAMENTI --}}
    @if($sale->payments->isNotEmpty())
        <div class="payments-wrapper">
            <div class="summary-title">Modalità di Pagamento</div>
            @foreach($sale->payments as $p)
                <p>
                    <strong>Scadenza {{ \Illuminate\Support\Carbon::parse($p->due_date)->format('d/m/Y') }}:</strong>
                    € {{ number_format($p->amount, 2, ',', '.') }}
                    @if($p->payment_method)
                        - {{ $p->payment_method->description }}
                    @endif
                    @if($p->is_payed)
                        <strong style="color: #27ae60;"> ✓ PAGATO</strong>
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

        Documento emesso ai sensi dell'art. 21 DPR 633/1972<br>
        Generato il {{ now()->format('d/m/Y H:i') }}
    </div>

</div>

</body>
</html>

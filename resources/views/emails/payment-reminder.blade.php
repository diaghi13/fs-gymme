<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promemoria Pagamento</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #1976d2;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f5f5f5;
            padding: 30px;
            border-radius: 0 0 5px 5px;
        }
        .payment-details {
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #1976d2;
            border-radius: 3px;
        }
        .payment-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .payment-details td {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .payment-details td:first-child {
            font-weight: bold;
            width: 40%;
        }
        .alert {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 3px;
        }
        .alert.danger {
            background-color: #f8d7da;
            border-left-color: #dc3545;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 0.9em;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1976d2;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 Promemoria Pagamento</h1>
    </div>

    <div class="content">
        <p>Gentile <strong>{{ $customerName }}</strong>,</p>

        @if ($daysOverdue > 0)
            <div class="alert danger">
                <strong>⚠️ Attenzione:</strong> Il pagamento è scaduto da <strong>{{ $daysOverdue }}</strong> {{ $daysOverdue === 1 ? 'giorno' : 'giorni' }}.
            </div>
        @else
            <div class="alert">
                <strong>⏰ Promemoria:</strong> Il pagamento è in scadenza oggi.
            </div>
        @endif

        <p>Ti ricordiamo che hai un pagamento in sospeso con i seguenti dettagli:</p>

        <div class="payment-details">
            <table>
                <tr>
                    <td>Documento:</td>
                    <td>{{ $payment->sale->progressive_number ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <td>Importo:</td>
                    <td><strong>€ {{ number_format($payment->amount / 100, 2, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td>Data Scadenza:</td>
                    <td>{{ $payment->due_date->format('d/m/Y') }}</td>
                </tr>
                <tr>
                    <td>Metodo Pagamento:</td>
                    <td>{{ $payment->payment_method->description ?? 'N/A' }}</td>
                </tr>
            </table>
        </div>

        <p>Ti preghiamo di provvedere al pagamento il prima possibile.</p>

        <p>Per qualsiasi domanda o chiarimento, non esitare a contattarci.</p>

        <div class="footer">
            <p>Questa è una comunicazione automatica. Per favore non rispondere a questa email.</p>
            <p>&copy; {{ date('Y') }} Gymme. Tutti i diritti riservati.</p>
        </div>
    </div>
</body>
</html>

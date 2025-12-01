<x-mail::message>
# Istruzioni per il Bonifico Bancario

Gentile {{ $tenant->name }},

Grazie per aver scelto il piano **{{ $plan->name }}** al prezzo di **€{{ number_format($plan->price, 2, ',', '.') }}** al mese.

Per completare la registrazione ed attivare il tuo abbonamento, ti preghiamo di effettuare un bonifico bancario utilizzando i seguenti dati:

---

## Coordinate Bancarie

**Beneficiario:** {{ $bankDetails['account_holder'] }}
**Banca:** {{ $bankDetails['bank_name'] }}
**IBAN:** `{{ $bankDetails['iban'] }}`
**BIC/SWIFT:** `{{ $bankDetails['bic'] }}`

**Importo:** **€{{ number_format($bankDetails['amount'], 2, ',', '.') }}**

**Causale (IMPORTANTE):** `{{ $bankDetails['reference'] }}`

---

## Importante

- **Utilizza esattamente la causale indicata** per permetterci di identificare il pagamento
- L'abbonamento verrà attivato **entro 24-48 ore** dalla ricezione del bonifico
- Riceverai una email di conferma appena l'abbonamento sarà attivato
- Il tuo account rimarrà **in attesa di pagamento** fino alla conferma

## Hai bisogno di aiuto?

Se hai domande o necessiti di assistenza, non esitare a contattarci rispondendo a questa email.

Grazie per la fiducia,
Il team di {{ config('app.name') }}

<x-mail::button :url="config('app.url')">
Vai al Portale
</x-mail::button>

---

<small>
Questa è una email automatica. Per favore non rispondere direttamente.
ID Abbonamento: {{ $subscriptionId }}
</small>
</x-mail::message>

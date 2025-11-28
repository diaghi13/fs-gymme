<x-mail::message>
# ❌ URGENTE: Fattura Elettronica Rifiutata dal SDI

Attenzione! La fattura elettronica è stata **rifiutata** dal Sistema di Interscambio (SDI).

## Dettagli Fattura

- **Cliente:** {{ $customerName }}
- **Numero Fattura:** {{ $invoiceNumber }}
- **Data:** {{ $invoiceDate }}
- **Importo:** € {{ $totalAmount }}
- **ID Trasmissione:** {{ $transmissionId }}
@if($externalId)
- **ID Esterno:** {{ $externalId }}
@endif

## Errori Riscontrati

```
{{ $sdiErrors }}
```

## Azioni Richieste

1. Accedi alla piattaforma e controlla i dettagli dell'errore
2. Correggi i dati della fattura secondo le indicazioni del SDI
3. Rigenera e reinvia la fattura elettronica

**⚠️ È necessario intervenire al più presto per completare l'iter fiscale.**

<x-mail::button :url="route('app.sales.show', ['tenant' => tenant('id'), 'sale' => $sale->id])">
Correggi Fattura
</x-mail::button>

## Hai Bisogno di Aiuto?

Se non riesci a risolvere, contatta il supporto tecnico allegando l'ID Trasmissione.

Grazie,<br>
{{ config('app.name') }}

@if(isset($signature) && $signature)
---

{!! nl2br(e($signature)) !!}
@endif
</x-mail::message>


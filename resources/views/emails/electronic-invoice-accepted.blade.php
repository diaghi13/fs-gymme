<x-mail::message>
# ✅ Fattura Elettronica Accettata dal SDI

Buone notizie! La fattura elettronica è stata **accettata** dal Sistema di Interscambio (SDI).

## Dettagli Fattura

- **Cliente:** {{ $customerName }}
- **Numero Fattura:** {{ $invoiceNumber }}
- **Data:** {{ $invoiceDate }}
- **Importo:** € {{ $totalAmount }}
- **ID Trasmissione:** {{ $transmissionId }}
@if($externalId)
- **ID Esterno:** {{ $externalId }}
@endif

## Cosa Significa?

La fattura è stata consegnata correttamente al destinatario e l'iter fiscale è completato con successo.

**Non è richiesta alcuna azione da parte tua.**

<x-mail::button :url="route('app.sales.show', ['tenant' => tenant('id'), 'sale' => $sale->id])">
Visualizza Fattura
</x-mail::button>

Grazie,<br>
{{ config('app.name') }}

@if(isset($signature) && $signature)
---

{!! nl2br(e($signature)) !!}
@endif
</x-mail::message>


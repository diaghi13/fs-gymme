@component('mail::message')
# {{ $dashboard['compliance_status']['status'] === 'critical' ? '🚨 GDPR Compliance Alert Critico' : ($dashboard['compliance_status']['status'] === 'warning' ? '⚠️ GDPR Compliance Warning' : '✅ GDPR Compliance Report') }}

**Tenant**: {{ $tenantName }}
**Data**: {{ now()->format('d/m/Y H:i') }}

---

## 📊 Stato Compliance

@component('mail::panel')
**Compliance**: {{ $dashboard['compliance_status']['compliance_percentage'] }}%
**Stato**: {{ strtoupper($dashboard['compliance_status']['status']) }}

- **Totale Fatture Scadute**: {{ $dashboard['compliance_status']['total_expired'] }}
- **Già Anonimizzate**: {{ $dashboard['compliance_status']['anonymized'] }}
- **Non Conformi**: {{ $dashboard['compliance_status']['non_compliant'] }}
@endcomponent

---

## 📋 Statistiche Generali

| Metrica | Valore |
|---------|--------|
| Totale Fatture | {{ $dashboard['stats']['total_invoices'] }} |
| Scadute (Non Anonimizzate) | {{ $dashboard['stats']['expired_not_anonymized'] }} |
| In Scadenza (3 mesi) | {{ $dashboard['stats']['near_expiry'] }} |
| Già Anonimizzate | {{ $dashboard['stats']['already_anonymized'] }} |

**Periodo Retention**: {{ $dashboard['retention_years'] }} anni
**Deadline Retention**: {{ $dashboard['retention_deadline'] }}

---

## 🔄 Risultati Ultima Esecuzione

@if($result['anonymized'] > 0)
@component('mail::panel')
✅ **Anonimizzazione Completata**

- Fatture Trovate: {{ $result['total_found'] }}
- Anonimizzate con Successo: {{ $result['anonymized'] }}
- Fallite: {{ $result['failed'] }}
@endcomponent
@else
ℹ️ Nessuna fattura da anonimizzare in questa esecuzione.
@endif

---

## 💡 Raccomandazioni

@foreach($dashboard['compliance_status']['status'] === 'critical' ? ['Azione immediata richiesta: Ci sono fatture oltre il periodo di retention che devono essere anonimizzate per conformità GDPR.'] : ($dashboard['compliance_status']['status'] === 'warning' ? ['Alcune fatture raggiungeranno la scadenza nei prossimi mesi. Pianifica la revisione.'] : ['Sistema completamente conforme. Nessuna azione richiesta.']) as $recommendation)
- {{ $recommendation }}
@endforeach

---

## 🔗 Azioni Disponibili

@component('mail::button', ['url' => route('app.configurations.gdpr-compliance')])
Visualizza Dashboard GDPR
@endcomponent

@component('mail::button', ['url' => config('app.url'), 'color' => 'secondary'])
Accedi al Sistema
@endcomponent

---

## 📚 Normativa di Riferimento

- **GDPR Art. 17**: Diritto all'oblio
- **CAD Art. 3**: Conservazione documenti digitali (10 anni)
- **DMEF 17/06/2014**: Conservazione sostitutiva fatture

---

*Questo è un messaggio automatico generato dal sistema GDPR Compliance.*
*Per supporto, contatta l'amministratore di sistema.*

Grazie,
{{ config('app.name') }}

@if(isset($signature) && $signature)
---

{!! nl2br(e($signature)) !!}
@endif
@endcomponent


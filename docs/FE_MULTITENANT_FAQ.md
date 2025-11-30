# FAQ - Fatturazione Elettronica Multi-Tenant

## Domande Frequenti

### 🏢 Architettura Multi-Tenant

#### Q: I miei clienti (palestre) possono usare la mia implementazione per fatturare ai loro clienti?
**A**: ✅ **SÌ, ESATTAMENTE!** È proprio questo lo scopo.

Ogni palestra (tenant) genera fatture elettroniche ai propri clienti finali (abbonati) tramite la tua piattaforma. Tu fornisci il servizio di fatturazione elettronica integrato in FS Gymme.

**Esempio**:
- Palestra "Fitness Club Roma" usa FS Gymme
- Vende abbonamento a Mario Rossi
- Click "Genera Fattura" in FS Gymme
- Sistema genera XML con Cedente = Fitness Club Roma
- Invia tramite il tuo account Fattura Elettronica API
- SDI consegna a Mario Rossi

---

#### Q: Devo creare 1 account per ogni palestra?
**A**: ❌ **NO!** 1 solo account copre TUTTI i tenant.

Le 50 fatture/mese incluse nel piano STARTER sono condivise tra tutte le palestre:
- 5 palestre x 10 fatture = 50 totali ✅
- Costo: €29/mese fisso

Quando superi 50 fatture totali, upgrade a PROFESSIONAL (200 fatture, €79/mese).

---

#### Q: Come fa l'API a sapere quale palestra sta emettendo?
**A**: Tramite i **dati nel XML** e i **metadata**.

Ogni XML contiene:
```xml
<CedentePrestatore>
  <IdFiscaleIVA>
    <IdPaese>IT</IdPaese>
    <IdCodice>12345678901</IdCodice> <!-- P.IVA Palestra Roma -->
  </IdFiscaleIVA>
  <Anagrafica>
    <Denominazione>Fitness Club Roma SSD</Denominazione>
  </Anagrafica>
</CedentePrestatore>
```

Metadata aggiuntivi nell'API call:
```json
{
  "metadata": {
    "tenant_id": "09ef7697-81b4-4c1d-a123-c85aefb12e9d",
    "structure_id": 1,
    "sale_id": 123
  }
}
```

---

#### Q: Chi è il "cedente" nella fattura elettronica?
**A**: **La palestra** (tuo tenant), non tu (FS Gymme).

```
Cedente (chi vende):      Palestra XYZ
Cessionario (chi compra): Cliente finale (Mario Rossi)
Trasmittente:             FS Gymme (tecnicamente)
```

SDI vede che la palestra sta emettendo fattura, anche se tecnicamente passi tu per l'invio.

---

### 💰 Modello Business

#### Q: Come faccio a farmi pagare questo servizio dalle palestre?
**A**: Hai 3 opzioni:

**Opzione 1: Incluso nel Piano (RACCOMANDATO)**
```
FS Gymme Pro: €99/mese
- Include: CRM + Vendite + Fatturazione Elettronica + tutto
- Tuo costo: €29/mese (ammortizzato su 3+ palestre)
- Margine: alto + valore percepito altissimo
```

**Opzione 2: Feature Add-on**
```
FS Gymme Base: €79/mese (senza FE)
FS Gymme + FE: €94/mese (+€15)

Conto economico:
- 3 palestre con FE = €45 ricavi
- Costo API: €29
- Margine: €16/mese
```

**Opzione 3: Freemium Marketing**
```
Primi 10 clienti: FE gratuita inclusa
- Loss leader per acquisizione
- Dopo 10 clienti, upgrade a piano PRO obbligatorio
```

---

#### Q: Se una palestra genera 100 fatture/mese, mi costa di più?
**A**: Dipende dal piano totale.

**Scenario**: 1 palestra genera 100 fatture/mese
- Devi essere su piano PROFESSIONAL (€79/mese)
- Puoi includere fino a 200 fatture totali
- Hai margine per altra palestra

**Raccomandazione**: Fai pagare €20-30/mese a quella palestra per coprire l'upgrade.

---

#### Q: Posso limitare il numero di fatture per tenant?
**A**: ✅ SÌ, puoi implementare limiti software.

Esempio logica:
```php
// Controlla fatture generate questo mese
$monthlyInvoices = ElectronicInvoice::where('tenant_id', $tenant->id)
    ->whereMonth('created_at', now()->month)
    ->count();

if ($monthlyInvoices >= $tenant->subscription->invoice_limit) {
    throw new Exception('Limite fatture mensili raggiunto. Upgrade piano.');
}
```

Associa limiti ai piani:
- Piano Basic: 20 fatture/mese
- Piano Pro: 50 fatture/mese
- Piano Enterprise: 200 fatture/mese

---

### 🔐 Privacy e Sicurezza

#### Q: FS Gymme vede i dati delle fatture delle palestre?
**A**: ✅ **SÌ**, tecnicamente sì (sei il provider).

Come piattaforma SaaS, hai accesso al database tenant con tutte le vendite e fatture. È normale e necessario per fornire il servizio.

**Best Practice**:
- Privacy policy chiara: "FS Gymme gestisce i dati per conto della palestra"
- Data processing agreement (DPA) firmato
- Crittografia dati sensibili (P.IVA, CF)
- Logs audit per compliance GDPR

---

#### Q: Posso vedere la dashboard Fattura Elettronica API?
**A**: ✅ SÌ, vedi tutte le fatture di tutti i tenant.

Nella dashboard FE API vedrai:
```
Fattura #1 - Palestra A → Cliente 1
Fattura #2 - Palestra A → Cliente 2
Fattura #3 - Palestra B → Cliente 1
...
```

Puoi filtrare per transmission_id o metadata per tenant specifico.

---

#### Q: Chi è responsabile legalmente delle fatture?
**A**: **La palestra** (cedente), non tu.

Tu sei solo il fornitore tecnologico (come Aruba o InfoCert). La responsabilità fiscale è della palestra che emette fattura.

**Disclaimer consigliato** (Terms of Service):
> "FS Gymme fornisce il servizio tecnico di trasmissione fatture elettroniche. La responsabilità legale e fiscale del contenuto delle fatture rimane in capo all'emittente (palestra)."

---

### 🔧 Implementazione Tecnica

#### Q: Come isolano i dati tra tenant?
**A**: Tramite il pattern **multi-tenancy by database**.

```php
// Già implementato in FS Gymme
Tenant::find($tenantId)->run(function () {
    // Query automaticamente filtrate per questo tenant
    $invoices = ElectronicInvoice::all(); // Solo di questo tenant
});
```

Ogni tenant ha:
- Database separato (SQLite file)
- Tabella `electronic_invoices` propria
- `transmission_id` univoco globale

---

#### Q: Come gestisco i webhook da Fattura Elettronica API?
**A**: Webhook contiene `transmission_id`, lo usi per trovare il tenant.

```php
// Webhook controller
public function __invoke(Request $request)
{
    $transmissionId = $request->json('transmission_id');
    
    // Trova invoice in TUTTI i tenant
    foreach (Tenant::all() as $tenant) {
        $tenant->run(function () use ($transmissionId) {
            $invoice = ElectronicInvoice::where('transmission_id', $transmissionId)->first();
            if ($invoice) {
                // Aggiorna status
                $invoice->update(['sdi_status' => 'accepted']);
            }
        });
    }
}
```

**Nota**: Questo richiede un loop su tutti i tenant. Per performance migliori, puoi aggiungere una lookup table centrale.

---

#### Q: Posso avere 1 account FE API per tenant?
**A**: ⚠️ **Tecnicamente sì, ma NON conviene**.

Costi:
- 10 palestre x €29/mese = **€290/mese**

vs

- 1 account condiviso = **€29-79/mese**

**Risparmio: €211-261/mese** con account condiviso.

Usa account condiviso a meno che tu non abbia requisiti enterprise specifici (es: palestre vogliono dashboard separata).

---

### 📊 Scaling & Performance

#### Q: Quante palestre posso gestire con 1 account?
**A**: Dipende dalle fatture medie per palestra.

| Piano | Fatture/Mese | Palestre (10 ft/mese) | Palestre (20 ft/mese) |
|-------|--------------|----------------------|----------------------|
| STARTER (€29) | 50 | 5 | 2-3 |
| PROFESSIONAL (€79) | 200 | 20 | 10 |
| BUSINESS (€149) | 500 | 50 | 25 |

**Rule of thumb**: Una palestra media fa 15-20 fatture/mese.

Con piano PROFESSIONAL (€79/mese) puoi gestire **10-13 palestre** comodamente.

---

#### Q: Cosa succede se supero il limite di fatture?
**A**: Fattura Elettronica API blocca l'invio e ti notifica.

**Soluzione**:
1. Upgrade immediato al piano superiore (prorata mensile)
2. Oppure: Acquisto pacchetto fatture extra (se disponibile)

**Prevenzione**:
- Dashboard FS Gymme con contatore fatture/mese
- Alert email quando raggiungi 80% limite
- Auto-upgrade piano (con conferma palestra)

---

#### Q: Come ottimizzare i costi se crescono?
**A**: Strategie per ridurre fatture/mese:

1. **Consolidamento fatture**:
   - Fattura cumulativa mensile invece di per-vendita
   - Es: 1 fattura riepilogativa vs 10 fatture separate

2. **Filtro intelligente**:
   - Fattura elettronica solo per importi >€77.47 (obbligo legale)
   - Sotto soglia: ricevuta/scontrino

3. **Piano personalizzato**:
   - A 500+ fatture/mese, negozia contratto custom

---

### 🚀 Marketing & Vendita

#### Q: Come spiego questo valore ai clienti?
**A**: Focus sui **benefici**, non la tecnologia.

**Messaggio chiave**:
> "Fattura elettronica automatica integrata. Genera e invia fatture ai tuoi clienti direttamente da FS Gymme con 1 click. Conservazione digitale inclusa per 10 anni."

**Value proposition**:
- ⏱️ Risparmio tempo: 5 min/fattura → 30 sec
- 🔒 Compliance automatica: zero errori SDI
- 📦 Conservazione inclusa: no provider extra
- 💼 Professionalità: fatture sempre puntuali

**Prezzo percepito**: €30-50/mese se venduto standalone
**Tuo costo**: €2.90/tenant (10 tenant su piano €29)
**Margine**: 10x+

---

#### Q: Posso offrirlo come upsell?
**A**: ✅ **ASSOLUTAMENTE SÌ!**

Strategia upsell:
```
Mese 1-3:   Cliente usa FS Gymme base
Mese 4:     "Prova gratuitamente Fatturazione Elettronica"
            (loss leader, copri con altri clienti)
Mese 5:     Cliente vede valore → "Solo €15/mese per continuare"
Conversione: ~60-80% dei clienti che provano
```

**Lifetime value**:
- Cliente base: €79/mese x 24 mesi = €1,896
- Cliente + FE: €94/mese x 24 mesi = €2,256
- **Delta: +€360 LTV per €15/mese feature**

---

### ✅ Best Practices

#### Q: Consigli per implementazione ottimale?
**A**: Checklist:

**1. Database**:
- ✅ Campo `external_id` per tracking API ID
- ✅ Index su `transmission_id` (webhook lookup veloce)
- ✅ Soft deletes su electronic_invoices

**2. Logging**:
- ✅ Log ogni chiamata API (success/error)
- ✅ Log webhook ricevuti
- ✅ Audit trail per GDPR

**3. Error Handling**:
- ✅ Retry automatico per errori temporanei (429, 500, 503)
- ✅ Email alert admin per errori critici
- ✅ Notifica palestra per scarto SDI (NS)

**4. UX**:
- ✅ Bottone "Genera Fattura" solo se sale completata
- ✅ Badge status visibile (Generata, Inviata, Accettata)
- ✅ Download XML/PDF in 1 click
- ✅ Timeline eventi SDI (sent → accepted → delivered)

**5. Billing**:
- ✅ Dashboard FS Gymme Admin: contatore fatture per tenant
- ✅ Report mensile costi API vs ricavi
- ✅ Alert quando vicino al limite piano

---

#### Q: Errori comuni da evitare?
**A**: Top 5 errori:

1. **❌ Non validare dati structure/customer prima di generare**
   - ✅ Soluzione: Validation strict su P.IVA, CF, indirizzo

2. **❌ Non gestire webhook duplicati**
   - ✅ Soluzione: Idempotency key, check status prima update

3. **❌ Non tracciare tenant nel webhook**
   - ✅ Soluzione: Metadata con tenant_id in ogni chiamata API

4. **❌ Non fare retry su errori temporanei**
   - ✅ Soluzione: Queue job con exponential backoff

5. **❌ Non avvisare palestra per scarto SDI**
   - ✅ Soluzione: Email immediata con errori + link fix

---

### 📞 Supporto

#### Q: Chi contattare per problemi tecnici?
**A**: Dipende dal tipo di problema:

**Problemi API/Invio**:
- Fattura Elettronica API: support@fattura-elettronica-api.it
- Dashboard: ticket system integrato

**Problemi SDI (scarto fattura)**:
- Forum Agenzia Entrate: https://forum.agenziaentrate.gov.it
- Assistenza commercialista della palestra

**Problemi FS Gymme (tua implementazione)**:
- Debug logs in Laravel
- Errori validation: check dati structure/customer
- Webhook non arrivano: verifica URL e signature

---

## 🎯 Quick Reference

### Flow Completo
```
1. Palestra completa vendita in FS Gymme
2. Click "Genera Fattura Elettronica"
3. ElectronicInvoiceService.generateXml()
   → XML salvato in storage
4. Click "Invia a SDI"
5. FatturaElettronicaApiService.send()
   → POST https://api.fattura-elettronica-api.it/v1/invoices
6. API → SDI → Cliente finale
7. Webhook ricevuto da FE API
   → POST https://tuodominio.it/webhooks/...
8. Update status in database tenant
9. Email notifica palestra (success/error)
```

### Costi Reali Esempio
```
Scenario: 8 palestre, 12 fatture/mese ciascuna

Fatture totali: 8 x 12 = 96/mese
Piano necessario: PROFESSIONAL (€79/mese, 200 fatture)

Revenue possibile:
- Opzione A: Incluso in €99/mese = €792/mese
- Opzione B: €15/mese add-on = €120/mese

Costo: €79/mese
Margine netto: €713/mese (Opt A) o €41/mese (Opt B)

ROI anno 1: +€8,556 (Opt A) o +€492 (Opt B)
```

---

**Aggiornato**: 11 Novembre 2025
**Domande?** Consulta `FE_API_INTEGRATION.md` per dettagli implementazione


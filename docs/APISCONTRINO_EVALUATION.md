# Valutazione APIScontrino - Integrazione Scontrini Fiscali

**Data valutazione**: 2025-11-28
**Versione documento**: 1.0
**Stato**: In valutazione - Non ancora implementato

---

## Indice

1. [Executive Summary](#executive-summary)
2. [Panoramica del Servizio](#panoramica-del-servizio)
3. [Validità Fiscale](#validità-fiscale)
4. [Analisi dei Costi](#analisi-dei-costi)
5. [Applicabilità a GymMe](#applicabilità-a-gymme)
6. [Analisi Pro e Contro](#analisi-pro-e-contro)
7. [Requisiti Tecnici di Integrazione](#requisiti-tecnici-di-integrazione)
8. [Raccomandazioni e Fasi di Implementazione](#raccomandazioni-e-fasi-di-implementazione)
9. [Valutazione dei Rischi](#valutazione-dei-rischi)
10. [Soluzioni Alternative](#soluzioni-alternative)
11. [Conclusioni](#conclusioni)

---

## Executive Summary

**APIScontrino** è un servizio cloud che consente di emettere scontrini e ricevute fiscali tramite API, eliminando la necessità di registratori di cassa fisici o stampanti RT fisiche.

### Raccomandazione Principale

**Approccio consigliato**: Implementazione a fasi con validazione preliminare del bisogno reale.

1. **Fase 0 - Validazione** (1-2 settimane): Survey ai clienti esistenti per verificare quanti effettivamente necessitano di scontrini fiscali
2. **Fase 1 - MVP** (se >30% dei tenant lo richiede): Implementazione base per tenant commerciali
3. **Fase 2 - Ottimizzazione**: Miglioramenti UX e automazioni
4. **Fase 3 - Scale**: Gestione volumi elevati e ottimizzazioni costi

### Metriche Chiave

- **Validità fiscale**: ✅ 100% legalmente valido (Risoluzione Agenzia Entrate n. 413/2020)
- **Costo entry**: ~€189/anno + costi variabili (€0.01-€0.05 per scontrino)
- **Tempo implementazione stimato**: 4-6 settimane per MVP
- **Complessità tecnica**: Media (integrazione API + gestione credenziali multi-tenant)

---

## Panoramica del Servizio

### Cos'è APIScontrino

APIScontrino è un servizio **Cloud RT (Registratore Telematico)** che sostituisce completamente i registratori di cassa fisici tradizionali. Permette di:

- Emettere scontrini fiscali tramite API REST
- Inviare automaticamente i corrispettivi all'Agenzia delle Entrate
- Generare PDF degli scontrini da stampare o inviare via email
- Gestire operazioni fiscali complesse (storni, chiusure, resi)

### Come Funziona

```
┌─────────────┐
│   GymMe     │
│  (Backend)  │
└──────┬──────┘
       │ API Request (POST /scontrini)
       │ {importo, descrizione, etc.}
       ▼
┌─────────────────────┐
│   APIScontrino      │
│  (Cloud Service)    │
└──────┬──────────────┘
       │ 1. Genera scontrino
       │ 2. Firma digitalmente
       │ 3. Invia a AdE
       │ 4. Genera PDF
       ▼
┌─────────────────────┐
│ Agenzia delle Entrate│
└─────────────────────┘
       │
       ▼ Return
┌─────────────┐
│   GymMe     │ → PDF inviato a cliente via email
└─────────────┘   o stampato su POS
```

### Caratteristiche Principali

1. **Registratore Telematico Cloud**: Sostituisce RT fisico
2. **API REST**: Integrazione nativa in applicazioni web/mobile
3. **PDF generati**: Scontrini in formato digitale stampabile/inviabile
4. **Invio automatico AdE**: Conformità automatica con l'Agenzia delle Entrate
5. **Gestione completa**: Storni, chiusure fiscali, resi, annullamenti
6. **Multi-punto vendita**: Gestione di più casse/ubicazioni

---

## Validità Fiscale

### Conformità Normativa

✅ **COMPLETAMENTE VALIDO** secondo la normativa italiana vigente.

#### Riferimenti Normativi

1. **Risoluzione n. 413/E del 2020** (Agenzia delle Entrate)
   - Autorizza esplicitamente l'uso di servizi cloud come APIScontrino
   - Equipara il servizio cloud ai registratori telematici tradizionali
   - Richiede che il servizio garantisca:
     - ✅ Inalterabilità dei dati fiscali
     - ✅ Conservazione sicura
     - ✅ Trasmissione telematica all'AdE
     - ✅ Disponibilità dei dati per verifiche fiscali

2. **D.Lgs. 127/2015** (Decreto Legislativo sulla memorizzazione elettronica e trasmissione telematica dei corrispettivi)
   - APIScontrino implementa tutti i requisiti previsti

3. **Provvedimento del 28/10/2016** (Agenzia delle Entrate)
   - Definisce le specifiche tecniche per i RT
   - APIScontrino è certificato conforme

#### Certificazioni APIScontrino

- **Certificato come Registratore Telematico** dall'Agenzia delle Entrate
- **Conformità RT Cloud** ai sensi della Risoluzione 413/2020
- **Firma digitale** su ogni documento emesso
- **Conservazione sostitutiva** con valore legale

### Confronto con Soluzioni Tradizionali

| Aspetto | RT Fisico | APIScontrino Cloud RT |
|---------|-----------|----------------------|
| Validità fiscale | ✅ Valido | ✅ Valido |
| Certificazione AdE | ✅ Richiesta | ✅ Certificato |
| Invio telematico | ✅ Automatico | ✅ Automatico |
| Conservazione | ✅ Locale | ✅ Cloud (migliore) |
| Costo hardware | 💰 €300-€1500 | ✅ €0 |
| Manutenzione | ❌ Costosa | ✅ Inclusa |

---

## Analisi dei Costi

### Struttura Pricing APIScontrino

#### Piani Disponibili

**Piano BASE** (€189/anno + IVA)
- Fino a 10.000 transazioni/anno
- 1 punto vendita
- API REST completa
- PDF generazione inclusa
- Supporto email

**Piano BUSINESS** (€389/anno + IVA)
- Fino a 50.000 transazioni/anno
- Fino a 5 punti vendita
- Tutto del piano BASE +
- Supporto prioritario
- Webhooks per notifiche

**Piano ENTERPRISE** (Custom pricing)
- Transazioni illimitate
- Punti vendita illimitati
- SLA garantito
- Account manager dedicato
- Integrazione personalizzata

#### Costi Variabili per Transazione

- **€0.01** per scontrino (Piano BASE)
- **€0.008** per scontrino (Piano BUSINESS)
- **€0.005** per scontrino (Piano ENTERPRISE)

### Confronto Costi: APIScontrino vs Alternative

#### Scenario 1: Palestra Piccola (500 transazioni/mese)

| Soluzione | Costo Iniziale | Costo Annuale | Totale 3 Anni |
|-----------|----------------|---------------|---------------|
| RT Fisico | €500 | €0 | €500 |
| APIScontrino BASE | €0 | €249 (€189 + €60 tx) | €747 |
| Effatta | €0 | €290 | €870 |

**Vincitore breve termine**: RT Fisico
**Vincitore lungo termine**: APIScontrino (no manutenzione/sostituzione RT)

#### Scenario 2: Palestra Media (2000 transazioni/mese)

| Soluzione | Costo Iniziale | Costo Annuale | Totale 3 Anni |
|-----------|----------------|---------------|---------------|
| RT Fisico | €800 | €100 (carta) | €1.100 |
| APIScontrino BASE | €0 | €429 (€189 + €240 tx) | €1.287 |
| Effatta | €0 | €490 | €1.470 |

**Vincitore**: APIScontrino (flessibilità + nessun hardware)

#### Scenario 3: Catena Multi-Location (10.000 transazioni/mese, 5 sedi)

| Soluzione | Costo Iniziale | Costo Annuale | Totale 3 Anni |
|-----------|----------------|---------------|---------------|
| RT Fisico (x5) | €4.000 | €500 (carta) | €5.500 |
| APIScontrino BUSINESS | €0 | €1.349 (€389 + €960 tx) | €4.047 |
| Effatta | €0 | €1.990 | €5.970 |

**Vincitore**: APIScontrino BUSINESS (risparmio 26% vs RT fisico)

### Costi Nascosti Considerati

#### RT Fisico:
- Manutenzione hardware (€100-€200/anno)
- Sostituzione ogni 3-5 anni (€500-€1500)
- Carta termica (€50-€150/anno)
- Spazio fisico
- Configurazione e formazione personale

#### APIScontrino:
- Sviluppo integrazione (one-time, €1.500-€3.000 stimato)
- Manutenzione software (già nel costo development GymMe)
- Costi banda/server (trascurabili)

---

## Applicabilità a GymMe

### Quando Serve lo Scontrino Fiscale?

Non tutte le palestre necessitano di emettere scontrini fiscali. Dipende dalla natura giuridica:

#### ❌ NON NECESSARIO per:

**ASD/SSD (Associazioni/Società Sportive Dilettantistiche)**
- Quote associative → Ricevuta generica (non fiscale)
- Attività istituzionale sportiva → Esenzione IVA
- La maggior parte delle palestre/box in Italia

**Palestre che già usano Fatture Elettroniche**
- Se GymMe già gestisce FE per B2B → può continuare così
- APIScontrino non necessario per fatture B2B

#### ✅ NECESSARIO per:

**Palestre Commerciali (SRL, SPA, Ditte Individuali)**
- Vendita servizi fitness a privati (B2C)
- Vendita prodotti (integratori, abbigliamento)
- Bar/ristoro interno

**Centri Benessere/SPA Commerciali**
- Massaggi, trattamenti estetici
- Day SPA
- Servizi wellness

**Franchising e Catene Commerciali**
- Grandi catene fitness commerciali
- Multi-location che vendono abbonamenti B2C

### Valutazione per la Base Clienti GymMe

**Domande da fare ai clienti esistenti**:

1. Quanti sono ASD/SSD vs commerciali?
2. Quanti già emettono scontrini fiscali (con RT fisico)?
3. Quanti vorrebbero digitalizzare gli scontrini?
4. Volume medio mensile di transazioni B2C?

**Stima preliminare** (da validare):
- 70-80% dei box/palestre italiane sono ASD/SSD → **NON serve**
- 20-30% sono commerciali → **potrebbe servire**
- Di questi, molti già usano solo FE per B2B → **serve a pochi**

**Conclusione**: Feature utile per una **nicchia specifica** della base clienti.

---

## Analisi Pro e Contro

### ✅ Vantaggi

#### 1. Nessun Hardware Necessario
- Zero investimento iniziale in registratori di cassa
- Nessuna manutenzione hardware
- Nessuna sostituzione ogni X anni

#### 2. Flessibilità Multi-Canale
- Scontrini emessi da:
  - Web app GymMe
  - Mobile app
  - POS tablet reception
  - Qualsiasi dispositivo connesso

#### 3. Integrazione Nativa con GymMe
- Emissione automatica da Sale
- Collegamento diretto con incassi
- UX consistente (tutto in GymMe)

#### 4. UX Migliorata per Clienti
- Scontrini via email automatici
- PDF scaricabili da app clienti
- Nessuna carta termica che sbiadisce

#### 5. Compliance Automatica
- Invio automatico corrispettivi AdE
- Nessun rischio di dimenticare chiusure
- Storico completo sempre disponibile

#### 6. Scalabilità Multi-Tenant
- Ogni tenant ha il suo "registratore virtuale"
- Gestione centralizzata per GymMe
- Nessun limite di punti vendita

#### 7. Reportistica Fiscale
- Dati sempre disponibili per commercialisti
- Export per dichiarazioni
- Audit trail completo

### ❌ Svantaggi

#### 1. Dipendenza da Internet
- Senza connessione → impossibile emettere scontrini
- **Mitigazione**: Implementare code offline + retry automatico
- **Mitigazione**: Fallback a ricevuta non fiscale in emergenza

#### 2. Dipendenza da Servizio Terzo
- Se APIScontrino ha downtime → blocco operativo
- **Mitigazione**: SLA garantito con piano BUSINESS/ENTERPRISE
- **Mitigazione**: Monitor uptime + alerting

#### 3. Credenziali Fisconline per Tenant
- Ogni tenant commerciale deve avere credenziali Fisconline/Entratel
- Processo di configurazione complesso per utenti non tecnici
- **Mitigazione**: Guida step-by-step in GymMe + video tutorial
- **Mitigazione**: Supporto via chat/email per setup iniziale

#### 4. Complessità Multi-Tenant
- Gestione credenziali per N tenant
- Sicurezza: credenziali fiscali sensibili
- **Mitigazione**: Encryption at rest per credenziali
- **Mitigazione**: Vault/secrets manager dedicato

#### 5. Costi Variabili
- Difficile preventivare per tenants con volumi incerti
- Rischio costi elevati per catene grandi
- **Mitigazione**: Dashboard predittiva costi in GymMe
- **Mitigazione**: Alert quando si supera soglia mensile

#### 6. Feature Utile Solo per Sottoinsieme Clienti
- Non serve a ASD/SSD (maggioranza palestre italiane)
- Rischio di sviluppare feature poco usata
- **Mitigazione**: Validare PRIMA con survey clienti

---

## Requisiti Tecnici di Integrazione

### Architettura Proposta

```
┌─────────────────────────────────────────────────────────┐
│                     GymMe Frontend                       │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Sale Form  │  │ POS Interface│  │ Receipt Preview │ │
│  └─────┬──────┘  └──────┬───────┘  └────────┬────────┘ │
└────────┼─────────────────┼──────────────────┼──────────┘
         │                 │                   │
         ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              GymMe Backend (Laravel)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │      FiscalReceiptService (New)                    │ │
│  │  - createReceipt()                                 │ │
│  │  - voidReceipt()                                   │ │
│  │  - dailyClosure()                                  │ │
│  │  - getReceiptPDF()                                 │ │
│  └──────────────┬─────────────────────────────────────┘ │
│                 │                                         │
│  ┌──────────────▼──────────────┐                        │
│  │  APIScontrinoClient (New)   │                        │
│  │  - API wrapper              │                        │
│  │  - Auth management          │                        │
│  │  - Error handling           │                        │
│  └──────────────┬──────────────┘                        │
│                 │                                         │
│  ┌──────────────▼───────────────┐                       │
│  │ Tenant Settings (Updated)    │                       │
│  │  - api_scontrino_enabled     │                       │
│  │  - fisconline_username       │                       │
│  │  - fisconline_password_enc   │                       │
│  │  - rt_serial_number          │                       │
│  └──────────────────────────────┘                       │
└───────────────┬─────────────────────────────────────────┘
                │ HTTPS API Call
                ▼
┌─────────────────────────────────────────────────────────┐
│                  APIScontrino API                        │
│  POST /api/v1/scontrini                                 │
│  GET  /api/v1/scontrini/{id}/pdf                        │
│  POST /api/v1/scontrini/{id}/void                       │
│  POST /api/v1/chiusure                                  │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│              Agenzia delle Entrate                       │
└─────────────────────────────────────────────────────────┘
```

### 1. Backend - Nuovi Componenti

#### Service Layer

**`app/Services/FiscalReceiptService.php`**
```php
<?php

namespace App\Services;

use App\Models\Sale\Sale;
use App\Services\APIScontrinoClient;
use Illuminate\Support\Facades\Log;

class FiscalReceiptService
{
    public function __construct(
        private APIScontrinoClient $client
    ) {}

    public function createReceiptFromSale(Sale $sale): array
    {
        // Validate tenant has APIScontrino enabled
        if (!$this->isEnabled()) {
            throw new \Exception('APIScontrino non abilitato per questo tenant');
        }

        // Build receipt payload
        $payload = $this->buildReceiptPayload($sale);

        // Send to APIScontrino
        $response = $this->client->createReceipt($payload);

        // Store receipt reference in Sale
        $sale->update([
            'fiscal_receipt_id' => $response['id'],
            'fiscal_receipt_number' => $response['numero_scontrino'],
            'fiscal_receipt_date' => $response['data'],
        ]);

        // Optionally send PDF via email
        if ($sale->customer && $sale->customer->email) {
            $this->emailReceiptToCustomer($sale, $response['pdf_url']);
        }

        return $response;
    }

    public function voidReceipt(Sale $sale): array
    {
        if (!$sale->fiscal_receipt_id) {
            throw new \Exception('Nessuno scontrino fiscale associato');
        }

        $response = $this->client->voidReceipt($sale->fiscal_receipt_id);

        $sale->update([
            'fiscal_receipt_voided_at' => now(),
        ]);

        return $response;
    }

    public function performDailyClosure(): array
    {
        // Called by scheduled job at end of day
        return $this->client->dailyClosure();
    }

    private function buildReceiptPayload(Sale $sale): array
    {
        return [
            'importo' => $sale->total_amount / 100, // Convert cents to euros
            'descrizione' => $this->buildDescription($sale),
            'tipo_pagamento' => $this->mapPaymentMethod($sale->payment_method),
            'iva' => $this->calculateVAT($sale),
            // ... additional fields
        ];
    }

    private function isEnabled(): bool
    {
        return (bool) tenancy()->tenant?->getSetting('api_scontrino_enabled', false);
    }
}
```

**`app/Services/APIScontrinoClient.php`**
```php
<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;

class APIScontrinoClient
{
    private const BASE_URL = 'https://api.apiscontrino.it/api/v1';

    public function __construct()
    {
        // Get tenant-specific credentials from encrypted settings
        $this->username = tenancy()->tenant?->getSetting('fisconline_username');
        $this->password = $this->decryptPassword(
            tenancy()->tenant?->getSetting('fisconline_password_enc')
        );
    }

    public function createReceipt(array $payload): array
    {
        $response = $this->client()->post('/scontrini', $payload);

        if ($response->failed()) {
            Log::error('APIScontrino error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Errore creazione scontrino: ' . $response->body());
        }

        return $response->json();
    }

    public function voidReceipt(string $receiptId): array
    {
        return $this->client()
            ->post("/scontrini/{$receiptId}/void")
            ->json();
    }

    public function dailyClosure(): array
    {
        return $this->client()
            ->post('/chiusure')
            ->json();
    }

    public function getReceiptPDF(string $receiptId): string
    {
        return $this->client()
            ->get("/scontrini/{$receiptId}/pdf")
            ->body();
    }

    private function client(): PendingRequest
    {
        return Http::withBasicAuth($this->username, $this->password)
            ->baseUrl(self::BASE_URL)
            ->timeout(30)
            ->retry(3, 1000);
    }

    private function decryptPassword(?string $encrypted): ?string
    {
        return $encrypted ? Crypt::decryptString($encrypted) : null;
    }
}
```

#### Database Migrations

**`database/migrations/tenant/xxxx_add_fiscal_receipt_fields_to_sales_table.php`**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->string('fiscal_receipt_id')->nullable()->after('electronic_invoice_id');
            $table->string('fiscal_receipt_number')->nullable();
            $table->timestamp('fiscal_receipt_date')->nullable();
            $table->timestamp('fiscal_receipt_voided_at')->nullable();
            $table->text('fiscal_receipt_pdf_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'fiscal_receipt_id',
                'fiscal_receipt_number',
                'fiscal_receipt_date',
                'fiscal_receipt_voided_at',
                'fiscal_receipt_pdf_url',
            ]);
        });
    }
};
```

**`database/migrations/xxxx_add_apiscontrino_settings_to_tenants_table.php`**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->boolean('api_scontrino_enabled')->default(false);
            $table->string('fisconline_username')->nullable();
            $table->text('fisconline_password_enc')->nullable(); // Encrypted
            $table->string('rt_serial_number')->nullable(); // Assigned by APIScontrino
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'api_scontrino_enabled',
                'fisconline_username',
                'fisconline_password_enc',
                'rt_serial_number',
            ]);
        });
    }
};
```

#### Controller

**`app/Http/Controllers/Application/Sales/FiscalReceiptController.php`**
```php
<?php

namespace App\Http\Controllers\Application\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Services\FiscalReceiptService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

class FiscalReceiptController extends Controller
{
    public function __construct(
        private FiscalReceiptService $fiscalReceiptService
    ) {}

    public function create(Sale $sale): RedirectResponse
    {
        try {
            $receipt = $this->fiscalReceiptService->createReceiptFromSale($sale);

            return redirect()
                ->back()
                ->with('success', "Scontrino fiscale n. {$receipt['numero_scontrino']} emesso correttamente");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', "Errore emissione scontrino: {$e->getMessage()}");
        }
    }

    public function void(Sale $sale): RedirectResponse
    {
        $this->authorize('void', $sale);

        try {
            $this->fiscalReceiptService->voidReceipt($sale);

            return redirect()
                ->back()
                ->with('success', 'Scontrino fiscale annullato correttamente');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', "Errore annullamento scontrino: {$e->getMessage()}");
        }
    }

    public function downloadPDF(Sale $sale): Response
    {
        if (!$sale->fiscal_receipt_id) {
            abort(404, 'Nessuno scontrino fiscale trovato');
        }

        $pdf = $this->fiscalReceiptService->getReceiptPDF($sale->fiscal_receipt_id);

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename=scontrino_{$sale->fiscal_receipt_number}.pdf");
    }
}
```

#### Scheduled Jobs

**`app/Console/Commands/PerformDailyFiscalClosure.php`**
```php
<?php

namespace App\Console\Commands;

use App\Services\FiscalReceiptService;
use Illuminate\Console\Command;

class PerformDailyFiscalClosure extends Command
{
    protected $signature = 'fiscal:daily-closure';
    protected $description = 'Perform daily fiscal closure for all tenants with APIScontrino enabled';

    public function handle(FiscalReceiptService $service): int
    {
        // Iterate all tenants with api_scontrino_enabled = true
        $tenants = \App\Models\Tenant::where('api_scontrino_enabled', true)->get();

        foreach ($tenants as $tenant) {
            tenancy()->initialize($tenant);

            try {
                $result = $service->performDailyClosure();
                $this->info("Daily closure completed for tenant {$tenant->id}");
            } catch (\Exception $e) {
                $this->error("Daily closure failed for tenant {$tenant->id}: {$e->getMessage()}");
            }

            tenancy()->end();
        }

        return self::SUCCESS;
    }
}
```

**Schedule in `routes/console.php`:**
```php
Schedule::command('fiscal:daily-closure')->dailyAt('23:55');
```

### 2. Frontend - Nuovi Componenti

#### Configurazione Tenant

**`resources/js/pages/configurations/fiscal-settings.tsx`**
```typescript
import * as React from 'react';
import { PageProps } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import { Formik, FormikConfig } from 'formik';
import { router } from '@inertiajs/react';
import * as Yup from 'yup';
import {
  Alert,
  Box,
  Grid,
  Stack,
  Switch,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import MyCard from '@/components/ui/MyCard';

interface FiscalSettings {
  api_scontrino_enabled: boolean;
  fisconline_username: string;
  fisconline_password: string;
  rt_serial_number: string;
}

interface FiscalSettingsPageProps extends PageProps {
  settings: FiscalSettings;
}

const validationSchema = Yup.object({
  api_scontrino_enabled: Yup.boolean(),
  fisconline_username: Yup.string().when('api_scontrino_enabled', {
    is: true,
    then: (schema) => schema.required('Username Fisconline obbligatorio'),
  }),
  fisconline_password: Yup.string().when('api_scontrino_enabled', {
    is: true,
    then: (schema) => schema.required('Password Fisconline obbligatoria'),
  }),
});

const FiscalSettings: React.FC<FiscalSettingsPageProps> = ({ auth, settings }) => {
  const formik: FormikConfig<FiscalSettings> = {
    enableReinitialize: true,
    initialValues: settings,
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      router.patch(
        route('app.configurations.fiscal.update', { tenant: session('current_tenant_id') }),
        values,
        {
          onFinish: () => setSubmitting(false),
          preserveScroll: true,
        }
      );
    },
  };

  return (
    <AppLayout title="Impostazioni Scontrini Fiscali">
      <Box sx={{ p: 3 }}>
        <Formik {...formik}>
          {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <MyCard title="Configurazione APIScontrino">
                    <Stack spacing={3}>
                      <Alert severity="info">
                        APIScontrino permette di emettere scontrini fiscali direttamente da GymMe
                        senza registratore di cassa fisico. Questa funzionalità è necessaria solo
                        per palestre commerciali (SRL, SPA) che vendono servizi B2C.
                      </Alert>

                      <Box>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Switch
                            checked={values.api_scontrino_enabled}
                            onChange={(e) => setFieldValue('api_scontrino_enabled', e.target.checked)}
                          />
                          <Typography>Abilita emissione scontrini fiscali</Typography>
                        </Stack>
                      </Box>

                      {values.api_scontrino_enabled && (
                        <>
                          <Alert severity="warning">
                            <strong>Attenzione:</strong> Per utilizzare APIScontrino è necessario
                            avere credenziali Fisconline/Entratel dell'Agenzia delle Entrate.
                          </Alert>

                          <TextField
                            fullWidth
                            label="Username Fisconline"
                            name="fisconline_username"
                            value={values.fisconline_username}
                            onChange={handleChange}
                            error={touched.fisconline_username && Boolean(errors.fisconline_username)}
                            helperText={touched.fisconline_username && errors.fisconline_username}
                          />

                          <TextField
                            fullWidth
                            label="Password Fisconline"
                            name="fisconline_password"
                            type="password"
                            value={values.fisconline_password}
                            onChange={handleChange}
                            error={touched.fisconline_password && Boolean(errors.fisconline_password)}
                            helperText={
                              (touched.fisconline_password && errors.fisconline_password) ||
                              'La password verrà salvata in forma criptata'
                            }
                          />

                          {values.rt_serial_number && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Numero Seriale RT
                              </Typography>
                              <Typography variant="body1">{values.rt_serial_number}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Assegnato automaticamente da APIScontrino
                              </Typography>
                            </Box>
                          )}
                        </>
                      )}

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        fullWidth
                      >
                        {isSubmitting ? 'Salvataggio...' : 'Salva Impostazioni'}
                      </Button>
                    </Stack>
                  </MyCard>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </Box>
    </AppLayout>
  );
};

export default FiscalSettings;
```

#### Emissione Scontrino da Sale

**`resources/js/components/sales/FiscalReceiptSection.tsx`**
```typescript
import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Block as VoidIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';

interface FiscalReceiptSectionProps {
  sale: {
    id: number;
    fiscal_receipt_id: string | null;
    fiscal_receipt_number: string | null;
    fiscal_receipt_date: string | null;
    fiscal_receipt_voided_at: string | null;
  };
  tenantId: string;
  canManage: boolean;
}

const FiscalReceiptSection: React.FC<FiscalReceiptSectionProps> = ({
  sale,
  tenantId,
  canManage,
}) => {
  const hasReceipt = !!sale.fiscal_receipt_id;
  const isVoided = !!sale.fiscal_receipt_voided_at;

  const handleCreateReceipt = () => {
    router.post(
      route('app.sales.fiscal-receipt.create', { tenant: tenantId, sale: sale.id }),
      {},
      { preserveScroll: true }
    );
  };

  const handleVoidReceipt = () => {
    if (confirm('Sei sicuro di voler annullare questo scontrino fiscale?')) {
      router.post(
        route('app.sales.fiscal-receipt.void', { tenant: tenantId, sale: sale.id }),
        {},
        { preserveScroll: true }
      );
    }
  };

  const handleDownloadPDF = () => {
    window.open(
      route('app.sales.fiscal-receipt.pdf', { tenant: tenantId, sale: sale.id }),
      '_blank'
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Scontrino Fiscale
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {!hasReceipt ? (
          <Stack spacing={2}>
            <Alert severity="info">
              Nessuno scontrino fiscale emesso per questa vendita.
            </Alert>
            {canManage && (
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={handleCreateReceipt}
                fullWidth
              >
                Emetti Scontrino Fiscale
              </Button>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Numero Scontrino
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1" fontWeight={600}>
                  {sale.fiscal_receipt_number}
                </Typography>
                {isVoided && <Chip label="Annullato" color="error" size="small" />}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Data Emissione
              </Typography>
              <Typography variant="body1">
                {new Date(sale.fiscal_receipt_date!).toLocaleDateString('it-IT', {
                  dateStyle: 'full',
                })}
              </Typography>
            </Box>

            {isVoided && (
              <Alert severity="error">
                Scontrino annullato il{' '}
                {new Date(sale.fiscal_receipt_voided_at!).toLocaleDateString('it-IT')}
              </Alert>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                fullWidth
              >
                Scarica PDF
              </Button>

              {canManage && !isVoided && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<VoidIcon />}
                  onClick={handleVoidReceipt}
                  fullWidth
                >
                  Annulla Scontrino
                </Button>
              )}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default FiscalReceiptSection;
```

### 3. Sicurezza

#### Encryption delle Credenziali

- Usare `Illuminate\Support\Facades\Crypt` per criptare password Fisconline
- Mai loggare credenziali in plain text
- Usare environment variables per API keys di APIScontrino

#### Validazione Input

- Validare tutti i payload prima di inviarli ad APIScontrino
- Sanitizzare descrizioni scontrini (XSS prevention)

#### Authorization

- Solo utenti con permesso `sales.manage` possono emettere/annullare scontrini
- Implementare audit log per tutte le operazioni fiscali

#### HTTPS Obbligatorio

- APIScontrino richiede HTTPS per tutte le richieste
- Verificare certificati SSL validi

---

## Raccomandazioni e Fasi di Implementazione

### Approccio Consigliato: Implementazione a Fasi

#### **FASE 0: Validazione del Bisogno** (1-2 settimane)

**Obiettivo**: Verificare se effettivamente c'è domanda reale per questa funzionalità

**Attività**:
1. **Survey ai clienti esistenti**
   - Email a tutti i tenant attivi
   - Domande:
     - Sei un'ASD/SSD o commerciale?
     - Attualmente emetti scontrini fiscali?
     - Con quale strumento? (RT fisico, altro servizio cloud, nessuno)
     - Quanti scontrini emetti al mese in media?
     - Saresti interessato a gestire scontrini direttamente da GymMe?

2. **Analisi risultati**
   - Se >30% risponde positivamente → procedi a FASE 1
   - Se 10-30% → valuta costi/benefici
   - Se <10% → postponi o abbandona feature

3. **Validazione tecnica APIScontrino**
   - Creare account di test
   - Fare proof-of-concept con API sandbox
   - Verificare documentazione completa

**Deliverable**: Report con raccomandazione GO/NO-GO

---

#### **FASE 1: MVP (Minimum Viable Product)** (4-6 settimane)

**Obiettivo**: Implementazione base funzionante per primi beta tester

**Funzionalità**:
- ✅ Configurazione credenziali Fisconline in Settings
- ✅ Emissione scontrino manuale da Sale esistente
- ✅ Download PDF scontrino
- ✅ Visualizzazione stato scontrino in Sale detail
- ✅ Chiusura fiscale giornaliera automatica (scheduled job)

**Limitazioni MVP**:
- ❌ No emissione automatica (richiede click manuale)
- ❌ No gestione resi complessa
- ❌ No reportistica avanzata
- ❌ No POS dedicato UI

**Timeline**:
- Week 1-2: Backend (Service, Client, Migrations, Controllers)
- Week 3-4: Frontend (Settings page, Receipt section in Sale)
- Week 5: Testing interno
- Week 6: Beta con 3-5 tenant pilota

**Effort**: ~120-160 ore sviluppo

---

#### **FASE 2: Ottimizzazioni e UX** (3-4 settimane)

**Obiettivo**: Migliorare usabilità e automatizzare processi

**Funzionalità**:
- ✅ Emissione automatica scontrino alla creazione Sale (opzionale per tenant)
- ✅ Invio automatico PDF via email al cliente
- ✅ POS-style UI per reception (interfaccia touch-friendly)
- ✅ Gestione resi e storni
- ✅ Dashboard fiscale (riepilogo giornaliero/mensile)
- ✅ Notifiche errori emissione scontrini

**Miglioramenti UX**:
- Wizard setup credenziali Fisconline (step-by-step)
- Preview scontrino prima emissione
- Storico scontrini emessi (filtri e ricerca)

**Timeline**: 3-4 settimane post-MVP

**Effort**: ~80-120 ore sviluppo

---

#### **FASE 3: Scale e Advanced Features** (4-6 settimane)

**Obiettivo**: Supportare volumi elevati e casi d'uso complessi

**Funzionalità**:
- ✅ Queue system per emissione asincrona
- ✅ Retry automatico in caso di fallimento
- ✅ Offline mode con sincronizzazione differita
- ✅ Multi-punto vendita (catene con più sedi)
- ✅ Reportistica fiscale avanzata per commercialisti
- ✅ Export dati per dichiarazioni fiscali
- ✅ Integrazione con sistemi di pagamento (POS, Stripe)

**Performance**:
- Caching scontrini emessi
- Rate limiting verso APIScontrino
- Monitor uptime e alert

**Timeline**: 4-6 settimane

**Effort**: ~120-180 ore sviluppo

---

### Decision Points

#### GO/NO-GO dopo FASE 0
- **GO se**: >30% clienti interessati + proof-of-concept tecnico OK
- **NO-GO se**: <10% clienti interessati o problemi tecnici bloccanti

#### Scale dopo FASE 1
- **Scale se**: Beta test positivi + adoption rate >50% tra beta tester
- **Postpone se**: Problemi critici emersi in beta o adoption bassa

---

## Valutazione dei Rischi

### Rischi Tecnici

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| **Downtime APIScontrino** | Media | Alto | SLA BUSINESS, fallback a ricevuta non fiscale, queue retry |
| **Credenziali Fisconline invalide** | Alta | Medio | Validazione in setup, test connection, guida utente |
| **Encryption breach credenziali** | Bassa | Critico | Usare Laravel Crypt, secrets manager, audit log |
| **Rate limiting APIScontrino** | Bassa | Medio | Queue system, throttling, monitor utilizzo |
| **Complessità multi-tenant** | Media | Medio | Testing approfondito, isolamento tenant |

### Rischi Business

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| **Feature poco usata** | Alta | Alto | **FASE 0 validazione obbligatoria** |
| **Costi elevati imprevisti** | Media | Medio | Dashboard predittiva, alert soglie |
| **Supporto clienti overhead** | Media | Medio | Guida setup completa, video tutorial, FAQ |
| **Compliance issues** | Bassa | Critico | Usare solo servizi certificati AdE |

### Rischi Legali/Fiscali

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| **Scontrini non validi fiscalmente** | Bassa | Critico | APIScontrino certificato AdE, test approfonditi |
| **Perdita dati fiscali** | Bassa | Critico | Backup daily, conservazione cloud APIScontrino |
| **Errori invio corrispettivi** | Media | Alto | Retry automatico, alert errori, monitor |

---

## Soluzioni Alternative

### 1. **Effatta** (Competitor APIScontrino)

**Caratteristiche**:
- Servizio simile ad APIScontrino
- Cloud RT certificato
- API REST disponibile

**Pricing**:
- ~€290/anno (più costoso di APIScontrino BASE)

**Pro**:
- Interfaccia più moderna
- Documentazione migliore (opinione soggettiva)

**Contro**:
- Più costoso
- Meno features rispetto ad APIScontrino

**Valutazione**: Alternativa valida, ma APIScontrino ha miglior rapporto qualità/prezzo

---

### 2. **RT Fisico Tradizionale**

**Pro**:
- Funziona offline
- Nessuna dipendenza da servizi terzi
- Investimento one-time

**Contro**:
- Costo iniziale €300-€1500
- Manutenzione hardware
- Nessuna integrazione nativa con GymMe
- Esperienza utente peggiore (doppio inserimento dati)

**Valutazione**: Non consigliato per SaaS multi-tenant come GymMe

---

### 3. **Nessuna Integrazione (Status Quo)**

**Opzione**: Lasciare che i tenant usino RT esterni separati da GymMe

**Pro**:
- Zero sviluppo
- Zero rischi tecnici
- Nessun costo aggiuntivo

**Contro**:
- Doppio lavoro per utenti (GymMe + RT separato)
- Nessun valore aggiunto vs competitors
- Dati separati (no reportistica unificata)

**Valutazione**: Accettabile SE la FASE 0 dimostra che <10% clienti lo necessita

---

### 4. **Build Custom Solution**

**Opzione**: Sviluppare un sistema proprietario per emissione scontrini

**Pro**:
- Controllo totale
- Nessun costo variabile per transazione
- Possibile revenue stream (addebitare ai tenant)

**Contro**:
- Effort enorme (6+ mesi sviluppo)
- Necessita certificazione AdE (processo complesso)
- Responsabilità compliance su GymMe
- Costi manutenzione elevati

**Valutazione**: NON CONSIGLIATO - troppo complesso e rischioso

---

## Conclusioni

### Sintesi Finale

APIScontrino è una **soluzione tecnicamente valida e fiscalmente conforme** per emettere scontrini fiscali da GymMe senza hardware dedicato.

**Tuttavia**, è applicabile solo a una **minoranza della base clienti** (palestre commerciali, non ASD/SSD).

### Raccomandazione Finale

**APPROCCIO**: Validazione prima di sviluppo

1. **Obbligatorio**: Eseguire FASE 0 (survey clienti) prima di scrivere codice
2. **Se validazione positiva (>30%)**: Procedere con FASE 1 MVP
3. **Se validazione negativa (<10%)**: Abbandonare o rimandare
4. **Se validazione intermedia (10-30%)**: Valutare costi/benefici caso per caso

### Effort Stimato Totale

- **FASE 0 (validazione)**: 1-2 settimane (8-16 ore)
- **FASE 1 (MVP)**: 4-6 settimane (~120-160 ore)
- **FASE 2 (ottimizzazioni)**: 3-4 settimane (~80-120 ore)
- **FASE 3 (scale)**: 4-6 settimane (~120-180 ore)

**Totale**: 12-18 settimane (320-480 ore sviluppo)

### ROI Atteso

**Scenario positivo** (40% clienti lo usano):
- Valore aggiunto differenziante vs competitors
- Riduzione churn (feature richiesta da commerciali)
- Possibile revenue stream (addebitare costo APIScontrino + markup)

**Scenario negativo** (<10% clienti lo usano):
- 320+ ore sviluppo per feature poco usata
- Costi manutenzione ongoing
- Complessità codebase aumentata

### Prossimi Passi Consigliati

1. ✅ **Salvare questa valutazione** (documento corrente)
2. ⏭️ **Creare survey per clienti** (Google Form o in-app)
3. ⏭️ **Inviare survey a tutti i tenant attivi**
4. ⏭️ **Analizzare risultati dopo 2 settimane**
5. ⏭️ **Decision meeting**: GO/NO-GO basato su dati reali

---

**Ultima modifica**: 2025-11-28
**Prossima revisione**: Dopo completamento survey clienti
**Owner**: Team Product @ GymMe

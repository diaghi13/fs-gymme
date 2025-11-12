# Integrazione Fattura Elettronica API

## Panoramica

**Provider**: https://www.fattura-elettronica-api.it/
**Tipo**: API RESTful moderna (JSON)
**Costo**: €29/mese (50 fatture) → €79/mese (200 fatture)

### 🏢 Architettura Multi-Tenant

**IMPORTANTE**: 1 account Fattura Elettronica API gestisce TUTTI i tenant di FS Gymme.

Ogni tenant (palestra) genera fatture con la propria P.IVA come cedente:
- ✅ XML contiene P.IVA del tenant, non di FS Gymme
- ✅ Le 50 fatture/mese sono condivise tra tutti i tenant
- ✅ Ogni tenant traccia le proprie fatture nel proprio database
- ✅ Webhook riconosce tenant tramite `transmission_id` nel metadata

### Vantaggi vs Aruba/InfoCert
✅ API RESTful semplice (no SOAP)
✅ Webhook automatici per notifiche SDI
✅ Conservazione sostitutiva integrata
✅ Firma digitale automatica
✅ Dashboard monitoraggio inclusa
✅ Sandbox gratuito per testing
✅ Documentazione eccellente

---

## STEP 1: Registrazione e Setup (30 min)

### 1. Crea Account
1. Vai su https://www.fattura-elettronica-api.it/
2. Registrati (prova gratuita 30 giorni)
3. Ottieni API Key dalla dashboard

### 2. Configurazione Laravel

```env
# .env
FE_API_ENABLED=true
FE_API_KEY=your_api_key_here
FE_API_ENDPOINT=https://api.fattura-elettronica-api.it/v1
FE_API_WEBHOOK_SECRET=your_webhook_secret

# Per testing
FE_API_SANDBOX=true
```

```php
// config/services.php
'fattura_elettronica_api' => [
    'enabled' => env('FE_API_ENABLED', false),
    'api_key' => env('FE_API_KEY'),
    'endpoint' => env('FE_API_ENDPOINT', 'https://api.fattura-elettronica-api.it/v1'),
    'webhook_secret' => env('FE_API_WEBHOOK_SECRET'),
    'sandbox' => env('FE_API_SANDBOX', false),
],
```

---

## STEP 2: Service Invio (2 ore)

### File: `app/Services/Sale/FatturaElettronicaApiService.php`

```php
<?php

namespace App\Services\Sale;

use App\Enums\ElectronicInvoiceStatusEnum;
use App\Models\Sale\ElectronicInvoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FatturaElettronicaApiService
{
    protected string $apiKey;
    protected string $endpoint;
    protected bool $sandbox;

    public function __construct()
    {
        $this->apiKey = config('services.fattura_elettronica_api.api_key');
        $this->endpoint = config('services.fattura_elettronica_api.endpoint');
        $this->sandbox = config('services.fattura_elettronica_api.sandbox', false);
    }

    /**
     * Invia fattura elettronica a SDI tramite API
     */
    public function send(ElectronicInvoice $electronicInvoice): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$this->endpoint}/invoices", [
                'xml_content' => base64_encode($electronicInvoice->xml_content),
                'filename' => "{$electronicInvoice->transmission_id}.xml",
                'sandbox' => $this->sandbox,
                'metadata' => [
                    'sale_id' => $electronicInvoice->sale_id,
                    'transmission_id' => $electronicInvoice->transmission_id,
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $electronicInvoice->update([
                    'sdi_status' => ElectronicInvoiceStatusEnum::SENT,
                    'sdi_sent_at' => now(),
                    'send_attempts' => ($electronicInvoice->send_attempts ?? 0) + 1,
                    'last_send_attempt_at' => now(),
                    'external_id' => $data['id'] ?? null, // ID assegnato dall'API
                ]);

                Log::info("Electronic invoice sent successfully", [
                    'transmission_id' => $electronicInvoice->transmission_id,
                    'api_id' => $data['id'] ?? null,
                ]);

                return [
                    'success' => true,
                    'message' => 'Fattura inviata con successo a SDI',
                    'api_id' => $data['id'] ?? null,
                    'data' => $data,
                ];
            }

            throw new \Exception($response->json('message') ?? 'Errore invio fattura');

        } catch (\Exception $e) {
            $electronicInvoice->update([
                'send_attempts' => ($electronicInvoice->send_attempts ?? 0) + 1,
                'last_send_attempt_at' => now(),
                'sdi_error_messages' => $e->getMessage(),
            ]);

            Log::error("Failed to send electronic invoice", [
                'transmission_id' => $electronicInvoice->transmission_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verifica stato fattura su API
     */
    public function checkStatus(ElectronicInvoice $electronicInvoice): ?array
    {
        if (!$electronicInvoice->external_id) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])->get("{$this->endpoint}/invoices/{$electronicInvoice->external_id}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Failed to check invoice status", [
                'external_id' => $electronicInvoice->external_id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Scarica ricevuta SDI dall'API
     */
    public function downloadReceipt(ElectronicInvoice $electronicInvoice, string $receiptType): ?string
    {
        if (!$electronicInvoice->external_id) {
            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])->get("{$this->endpoint}/invoices/{$electronicInvoice->external_id}/receipts/{$receiptType}");

            if ($response->successful()) {
                return $response->body();
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Failed to download receipt", [
                'external_id' => $electronicInvoice->external_id,
                'receipt_type' => $receiptType,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
```

---

## STEP 3: Controller Invio (30 min)

### File: `app/Http/Controllers/Application/Sales/ElectronicInvoice/SendController.php`

```php
<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Services\Sale\FatturaElettronicaApiService;
use Illuminate\Http\RedirectResponse;

class SendController extends Controller
{
    public function __invoke(Sale $sale, FatturaElettronicaApiService $service): RedirectResponse
    {
        if (!$sale->electronic_invoice) {
            return redirect()->back()->withErrors([
                'invoice' => 'Genera prima la fattura elettronica'
            ]);
        }

        if ($sale->electronic_invoice->sdi_status !== 'generated') {
            return redirect()->back()->withErrors([
                'invoice' => 'La fattura è già stata inviata o è in uno stato non valido'
            ]);
        }

        $result = $service->send($sale->electronic_invoice);

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->withErrors([
            'send' => $result['message']
        ]);
    }
}
```

---

## STEP 4: Webhook Notifiche SDI (1 ora)

### Route Webhook

```php
// routes/webhooks.php (fuori da middleware tenant/auth)
Route::post('/webhooks/fattura-elettronica-api/notifications', 
    \App\Http\Controllers\Webhooks\FatturaElettronicaApiWebhookController::class)
    ->name('webhooks.fattura-elettronica-api');
```

### Controller Webhook

```php
<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Sale\ElectronicInvoice;
use App\Enums\ElectronicInvoiceStatusEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class FatturaElettronicaApiWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // Verifica signature webhook
        $signature = $request->header('X-Webhook-Signature');
        $secret = config('services.fattura_elettronica_api.webhook_secret');
        
        $expectedSignature = hash_hmac('sha256', $request->getContent(), $secret);
        
        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Invalid webhook signature');
            return response()->noContent(401);
        }

        $payload = $request->json()->all();
        
        Log::info('Fattura Elettronica API Webhook received', $payload);

        // Trova fattura per transmission_id o external_id
        $electronicInvoice = ElectronicInvoice::where('transmission_id', $payload['transmission_id'] ?? null)
            ->orWhere('external_id', $payload['invoice_id'] ?? null)
            ->first();

        if (!$electronicInvoice) {
            Log::warning('Electronic invoice not found', [
                'transmission_id' => $payload['transmission_id'] ?? null,
                'invoice_id' => $payload['invoice_id'] ?? null,
            ]);
            return response()->noContent();
        }

        // Gestisci evento in base al tipo
        match ($payload['event_type'] ?? null) {
            'invoice.accepted' => $this->handleAccepted($electronicInvoice, $payload),
            'invoice.rejected' => $this->handleRejected($electronicInvoice, $payload),
            'invoice.delivered' => $this->handleDelivered($electronicInvoice, $payload),
            'invoice.expired' => $this->handleExpired($electronicInvoice, $payload),
            default => Log::warning('Unknown event type', ['event' => $payload['event_type'] ?? null]),
        };

        return response()->noContent();
    }

    protected function handleAccepted(ElectronicInvoice $electronicInvoice, array $payload): void
    {
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::ACCEPTED,
            'sdi_received_at' => now(),
            'sdi_notification_type' => 'RC',
            'sdi_receipt_xml' => $payload['receipt_xml'] ?? null,
        ]);

        Log::info('Invoice accepted by SDI', [
            'transmission_id' => $electronicInvoice->transmission_id,
        ]);

        // TODO: Invia email notifica a structure
        // Mail::to($structure->email)->send(new InvoiceAcceptedNotification($electronicInvoice));
    }

    protected function handleRejected(ElectronicInvoice $electronicInvoice, array $payload): void
    {
        $errors = collect($payload['errors'] ?? [])->pluck('message')->implode("\n");

        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::REJECTED,
            'sdi_received_at' => now(),
            'sdi_notification_type' => 'NS',
            'sdi_error_messages' => $errors,
            'sdi_receipt_xml' => $payload['receipt_xml'] ?? null,
        ]);

        Log::warning('Invoice rejected by SDI', [
            'transmission_id' => $electronicInvoice->transmission_id,
            'errors' => $errors,
        ]);

        // TODO: Invia email urgente con errori
        // Mail::to($structure->email)->send(new InvoiceRejectedNotification($electronicInvoice));
    }

    protected function handleDelivered(ElectronicInvoice $electronicInvoice, array $payload): void
    {
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::DELIVERED,
            'sdi_notification_type' => 'DT',
        ]);

        Log::info('Invoice delivered to customer', [
            'transmission_id' => $electronicInvoice->transmission_id,
        ]);
    }

    protected function handleExpired(ElectronicInvoice $electronicInvoice, array $payload): void
    {
        Log::info('Invoice delivery expired (15 days passed)', [
            'transmission_id' => $electronicInvoice->transmission_id,
        ]);
        
        // Dopo 15 giorni senza rifiuto = consegnata per decorrenza termini
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::DELIVERED,
            'sdi_notification_type' => 'DT',
        ]);
    }
}
```

---

## STEP 5: Frontend Bottone Invio (30 min)

### Aggiorna ElectronicInvoiceCard

```tsx
// In ElectronicInvoiceCard.tsx, aggiungi:

const handleSend = () => {
  if (!confirm('Inviare la fattura elettronica al Sistema di Interscambio (SDI)?')) {
    return;
  }
  
  router.post(route('app.sales.electronic-invoice.send', { 
    sale: sale.id, 
    tenant: tenantId 
  }));
};

// Nel render, sostituisci il bottone "Invia a SDI" con:
{sale.electronic_invoice.sdi_status === 'generated' && (
  <Button
    variant="contained"
    color="primary"
    startIcon={<Send size={20} />}
    onClick={handleSend}
    sx={{ mt: 1 }}
    fullWidth
  >
    Invia a SDI
  </Button>
)}
```

---

## STEP 6: Testing (2 ore)

### Test Unitario Service

```php
// tests/Unit/Services/FatturaElettronicaApiServiceTest.php

use App\Services\Sale\FatturaElettronicaApiService;
use Illuminate\Support\Facades\Http;

test('can send invoice to API', function () {
    Http::fake([
        '*/invoices' => Http::response([
            'success' => true,
            'id' => 'inv_123456',
            'status' => 'sent',
        ], 200),
    ]);

    $electronicInvoice = ElectronicInvoice::factory()->create([
        'xml_content' => '<xml>test</xml>',
        'transmission_id' => 'TEST123',
    ]);

    $service = new FatturaElettronicaApiService();
    $result = $service->send($electronicInvoice);

    expect($result['success'])->toBeTrue();
    expect($electronicInvoice->fresh()->sdi_status)->toBe('sent');
});
```

### Test Feature Webhook

```php
// tests/Feature/Webhooks/FatturaElettronicaApiWebhookTest.php

test('webhook handles invoice accepted', function () {
    $electronicInvoice = ElectronicInvoice::factory()->create([
        'transmission_id' => 'TEST123',
        'sdi_status' => 'sent',
    ]);

    $payload = [
        'event_type' => 'invoice.accepted',
        'transmission_id' => 'TEST123',
        'invoice_id' => 'inv_123',
        'receipt_xml' => '<ricevuta>ok</ricevuta>',
    ];

    $signature = hash_hmac('sha256', json_encode($payload), config('services.fattura_elettronica_api.webhook_secret'));

    $response = $this->postJson('/webhooks/fattura-elettronica-api/notifications', $payload, [
        'X-Webhook-Signature' => $signature,
    ]);

    $response->assertNoContent();
    
    $electronicInvoice->refresh();
    expect($electronicInvoice->sdi_status)->toBe('accepted');
    expect($electronicInvoice->sdi_notification_type)->toBe('RC');
});
```

---

## STEP 7: Configurazione Dashboard API (15 min)

### 1. Configura Webhook URL
Nella dashboard di Fattura Elettronica API, imposta:
```
Webhook URL: https://tuodominio.it/webhooks/fattura-elettronica-api/notifications
```

### 2. Copia Webhook Secret
Copia il secret generato e mettilo in `.env`:
```env
FE_API_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 3. Test Webhook
Usa il bottone "Test Webhook" nella dashboard per verificare che funzioni.

---

## Costi Dettagliati

### Costo Mensile Stimato per FS Gymme

**Scenario 1: Startup (primi 6 mesi)**
- Fatture/mese: ~30-40
- Piano: STARTER €29/mese
- **Totale: €29/mese**

**Scenario 2: Crescita (6-12 mesi)**
- Fatture/mese: ~80-120
- Piano: PROFESSIONAL €79/mese
- **Totale: €79/mese**

**Scenario 3: Maturo (12+ mesi)**
- Fatture/mese: 150-180
- Piano: PROFESSIONAL €79/mese
- **Totale: €79/mese**

### ROI - Risparmio Tempo

**Senza API** (gestione manuale):
- Tempo/fattura: 10 min
- 50 fatture/mese = 500 min = 8.3 ore
- Costo operatore €20/h = **€166/mese**

**Con API**:
- Tempo/fattura: 1 min (click bottone)
- 50 fatture/mese = 50 min = 0.8 ore
- Costo operatore €20/h = €16/mese
- **Risparmio: €150/mese**

**Break-even immediato**: €29 API - €150 risparmio = **+€121/mese saved** ✅

---

## Confronto Finale

| Feature | Fattura Elettronica API | Aruba | AgE Gratuito |
|---------|------------------------|-------|--------------|
| **Implementazione** | ⭐⭐⭐⭐⭐ (2 giorni) | ⭐⭐ (5 giorni) | ⭐ (no API) |
| **Costo** | €29-79/mese | €25 + €0.10/ft | €0 |
| **Webhook Auto** | ✅ Sì | ❌ No (polling) | ❌ No |
| **Conservazione** | ✅ Inclusa | ❌ Extra | ✅ Sì (manuale) |
| **Dashboard** | ✅ Sì | ✅ Sì | ✅ Sì |
| **Sandbox** | ✅ Sì | ❌ No | ❌ No |
| **Supporto** | ✅ Ticket + email | ✅ Telefono | ❌ Forum |

---

## Raccomandazione Finale

### ✅ SÌ, Integra Fattura Elettronica API

**Motivi:**
1. ⭐ **Implementazione Veloce**: 2 giorni vs 5+ giorni Aruba
2. 💰 **Costo Ragionevole**: €29/mese è ottimo per startup
3. 🚀 **API Moderna**: RESTful JSON vs SOAP complicato
4. 🔔 **Webhook Automatici**: No polling, notifiche real-time
5. 📦 **Tutto Incluso**: Conservazione + firma + dashboard
6. 🧪 **Sandbox Gratuito**: Test senza rischi
7. 📈 **Scalabile**: Upgrade semplice quando cresci

**Timeline Implementazione:**
- Giorno 1: Setup account + Service (3 ore)
- Giorno 2: Controller + Routes (2 ore)
- Giorno 3: Webhook + Testing (3 ore)
- Giorno 4: Frontend + Deploy (2 ore)
- **TOTALE: 4 giorni part-time**

**Inizio Consigliato**: Piano STARTER €29/mese, poi upgrade quando superi 50 fatture/mese.

---

## Prossimo Step: Implementiamo?

Vuoi che inizi a creare i file del Service, Controller e Webhook? Posso farlo subito! 🚀


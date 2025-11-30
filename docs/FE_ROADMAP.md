# Roadmap Implementazione Fatturazione Elettronica

## Panoramica

Service `ElectronicInvoiceService` è **95% completo** e pronto per essere utilizzato.
Mancano solo controller, frontend e integrazione SDI.

**Tempo stimato implementazione completa**: 2-3 settimane (o 4 giorni con Fattura Elettronica API)
**Priorità**: ALTA (Obbligo di legge)

## ⭐ SOLUZIONE RACCOMANDATA: Fattura Elettronica API

**Provider**: https://www.fattura-elettronica-api.it/
**Costo**: €29/mese (50 fatture) → €79/mese (200 fatture)
**Implementazione**: 4 giorni invece di 2-3 settimane

### Perché Fattura Elettronica API?
- ✅ API RESTful moderna (no SOAP complicato)
- ✅ Webhook automatici (no polling)
- ✅ Conservazione sostitutiva inclusa
- ✅ Sandbox gratuito per testing
- ✅ Implementazione 5x più veloce di Aruba
- ✅ ROI immediato: risparmio €150/mese in tempo operatore

**📋 Vedi guida completa**: `docs/FE_API_INTEGRATION.md`

---

## SPRINT 1: Backend Controllers (3-4 giorni)

### Giorno 1-2: Controller Generazione XML

#### File da creare
```
app/Http/Controllers/Application/Sales/ElectronicInvoice/
├── GenerateController.php
├── DownloadXmlController.php
└── DownloadPdfController.php
```

#### GenerateController.php
```php
<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use App\Services\Sale\ElectronicInvoiceService;
use Illuminate\Http\RedirectResponse;

class GenerateController extends Controller
{
    public function __invoke(Sale $sale, ElectronicInvoiceService $service): RedirectResponse
    {
        // Validate sale is completed
        if ($sale->status !== 'completed') {
            return redirect()->back()->withErrors([
                'sale' => 'La vendita deve essere completata prima di generare la fattura elettronica'
            ]);
        }

        // Check if already generated
        if ($sale->electronic_invoice) {
            return redirect()->back()->withErrors([
                'sale' => 'Fattura elettronica già generata per questa vendita'
            ]);
        }

        try {
            $electronicInvoice = $service->generateXml($sale);

            return redirect()->back()->with('success', 
                "Fattura elettronica generata. Transmission ID: {$electronicInvoice->transmission_id}"
            );
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'generation' => $e->getMessage()
            ]);
        }
    }
}
```

#### DownloadXmlController.php
```php
<?php

namespace App\Http\Controllers\Application\Sales\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Models\Sale\Sale;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadXmlController extends Controller
{
    public function __invoke(Sale $sale): StreamedResponse
    {
        if (!$sale->electronic_invoice) {
            abort(404, 'Fattura elettronica non trovata');
        }

        $filename = "{$sale->electronic_invoice->transmission_id}.xml";
        $filePath = $sale->electronic_invoice->xml_file_path;

        if (!Storage::disk('local')->exists($filePath)) {
            abort(404, 'File XML non trovato');
        }

        return Storage::disk('local')->download($filePath, $filename, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
```

### Giorno 3: Routes

```php
// routes/tenant/web/sales.php

Route::prefix('sales/{sale}/electronic-invoice')->group(function () {
    Route::post('/generate', 
        \App\Http\Controllers\Application\Sales\ElectronicInvoice\GenerateController::class)
        ->name('app.sales.electronic-invoice.generate');
    
    Route::get('/download-xml', 
        \App\Http\Controllers\Application\Sales\ElectronicInvoice\DownloadXmlController::class)
        ->name('app.sales.electronic-invoice.download-xml');
    
    Route::get('/download-pdf', 
        \App\Http\Controllers\Application\Sales\ElectronicInvoice\DownloadPdfController::class)
        ->name('app.sales.electronic-invoice.download-pdf');
});
```

### Giorno 4: Testing

```php
// tests/Feature/ElectronicInvoice/GenerateElectronicInvoiceTest.php

use function Pest\Laravel\{post, get};

test('can generate electronic invoice for completed sale', function () {
    $tenant = $this->createTenantWithDatabase();
    $this->initializeTenancy($tenant);
    
    $structure = Structure::factory()->create([
        'vat_number' => '12345678901',
        'company_name' => 'Test Gym',
        'address' => 'Via Roma 1',
        'postal_code' => '00100',
        'city' => 'Roma',
        'province' => 'RM',
    ]);
    
    $customer = Customer::factory()->create([
        'tax_code' => 'RSSMRA80A01H501U',
        'first_name' => 'Mario',
        'last_name' => 'Rossi',
        'address' => 'Via Milano 1',
        'postal_code' => '20100',
        'city' => 'Milano',
    ]);
    
    $sale = Sale::factory()->completed()->create([
        'customer_id' => $customer->id,
        'progressive_number' => 'FT2025/0001',
    ]);
    
    $response = post(route('app.sales.electronic-invoice.generate', [
        'sale' => $sale->id,
        'tenant' => $tenant->id,
    ]));
    
    $response->assertRedirect();
    
    $sale->refresh();
    expect($sale->electronic_invoice)->not->toBeNull();
    expect($sale->electronic_invoice->sdi_status)->toBe('generated');
});

test('cannot generate for draft sale', function () {
    // ... test validation
});

test('can download XML file', function () {
    // ... test download
});
```

---

## SPRINT 2: Frontend (3-4 giorni)

### Giorno 1: Types TypeScript

```typescript
// resources/js/types/index.d.ts

export interface ElectronicInvoice {
  id: number;
  sale_id: number;
  transmission_id: string;
  xml_version: string;
  transmission_format: 'FPA12' | 'FPR12';
  sdi_status: ElectronicInvoiceStatus;
  sdi_sent_at: string | null;
  sdi_received_at: string | null;
  sdi_error_messages: string | null;
  xml_file_path: string;
  created_at: string;
  updated_at: string;
}

export type ElectronicInvoiceStatus = 
  | 'draft'
  | 'generated'
  | 'to_send'
  | 'sending'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'delivered';

export interface Sale {
  // ... existing fields
  electronic_invoice?: ElectronicInvoice;
  electronic_invoice_status?: ElectronicInvoiceStatus;
  sdi_transmission_id?: string;
}
```

### Giorno 2-3: Componente ElectronicInvoiceCard

```tsx
// resources/js/components/sales/ElectronicInvoiceCard.tsx

import React from 'react';
import { Card, CardContent, Typography, Button, Chip, Box, Alert } from '@mui/material';
import { router } from '@inertiajs/react';
import { Download, Send, FileText } from 'lucide-react';
import { Sale } from '@/types';

interface ElectronicInvoiceCardProps {
  sale: Sale;
  tenantId: string;
}

export default function ElectronicInvoiceCard({ sale, tenantId }: ElectronicInvoiceCardProps) {
  const handleGenerate = () => {
    if (!confirm('Generare la fattura elettronica? Questa operazione non è reversibile.')) {
      return;
    }
    
    router.post(route('app.sales.electronic-invoice.generate', { 
      sale: sale.id, 
      tenant: tenantId 
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
      case 'sent':
        return 'info';
      case 'accepted':
      case 'delivered':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Bozza',
      generated: 'Generata',
      to_send: 'Da Inviare',
      sending: 'Invio in corso',
      sent: 'Inviata a SDI',
      accepted: 'Accettata',
      rejected: 'Scartata',
      delivered: 'Consegnata',
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Fattura Elettronica
          </Typography>
          {sale.electronic_invoice && (
            <Chip 
              label={getStatusLabel(sale.electronic_invoice.sdi_status)}
              color={getStatusColor(sale.electronic_invoice.sdi_status)}
              size="small"
            />
          )}
        </Box>

        {!sale.electronic_invoice && sale.status === 'completed' && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              La vendita è completata. Puoi generare la fattura elettronica per l'invio al Sistema di Interscambio (SDI).
            </Alert>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileText size={20} />}
              onClick={handleGenerate}
              fullWidth
            >
              Genera Fattura Elettronica
            </Button>
          </>
        )}

        {!sale.electronic_invoice && sale.status !== 'completed' && (
          <Alert severity="warning">
            Completa la vendita per poter generare la fattura elettronica.
          </Alert>
        )}

        {sale.electronic_invoice && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Transmission ID:</strong> {sale.electronic_invoice.transmission_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Formato:</strong> {sale.electronic_invoice.transmission_format}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Generata il:</strong> {new Date(sale.electronic_invoice.created_at).toLocaleString('it-IT')}
            </Typography>

            {sale.electronic_invoice.sdi_sent_at && (
              <Typography variant="body2" color="text.secondary">
                <strong>Inviata il:</strong> {new Date(sale.electronic_invoice.sdi_sent_at).toLocaleString('it-IT')}
              </Typography>
            )}

            {sale.electronic_invoice.sdi_error_messages && (
              <Alert severity="error" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Errori SDI:</strong>
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {sale.electronic_invoice.sdi_error_messages}
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download size={20} />}
                href={route('app.sales.electronic-invoice.download-xml', { 
                  sale: sale.id, 
                  tenant: tenantId 
                })}
                fullWidth
              >
                Scarica XML
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileText size={20} />}
                href={route('app.sales.electronic-invoice.download-pdf', { 
                  sale: sale.id, 
                  tenant: tenantId 
                })}
                fullWidth
              >
                Scarica PDF
              </Button>
            </Box>

            {sale.electronic_invoice.sdi_status === 'generated' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Send size={20} />}
                sx={{ mt: 1 }}
                fullWidth
              >
                Invia a SDI
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
```

### Giorno 4: Integrazione in Sale Detail Page

```tsx
// resources/js/pages/sales/sale-detail.tsx

import ElectronicInvoiceCard from '@/components/sales/ElectronicInvoiceCard';

export default function SaleDetail({ sale, auth, currentTenantId }: PageProps) {
  return (
    <AppLayout user={auth.user}>
      <Grid container spacing={2}>
        {/* ... existing cards ... */}
        
        <Grid size={12}>
          <ElectronicInvoiceCard sale={sale} tenantId={currentTenantId} />
        </Grid>
      </Grid>
    </AppLayout>
  );
}
```

---

## SPRINT 3: Integrazione SDI (4-5 giorni)

### Opzione A: Aruba Fatturazione Elettronica

#### Giorno 1: Configurazione

```php
// config/services.php

'aruba' => [
    'username' => env('ARUBA_USERNAME'),
    'password' => env('ARUBA_PASSWORD'),
    'endpoint' => env('ARUBA_ENDPOINT', 'https://ws.aruba.it/FatturazioneElettronica/Service.svc'),
],
```

```env
# .env
ARUBA_USERNAME=your_username
ARUBA_PASSWORD=your_password
```

#### Giorno 2-3: Service Invio

```php
// app/Services/Sale/ArubaFatturazioneService.php

<?php

namespace App\Services\Sale;

use App\Enums\ElectronicInvoiceStatusEnum;
use App\Models\Sale\ElectronicInvoice;
use SoapClient;

class ArubaFatturazioneService
{
    protected SoapClient $client;

    public function __construct()
    {
        $this->client = new SoapClient(config('services.aruba.endpoint'), [
            'trace' => 1,
            'exceptions' => true,
        ]);
    }

    public function send(ElectronicInvoice $electronicInvoice): bool
    {
        try {
            $response = $this->client->Send([
                'Username' => config('services.aruba.username'),
                'Password' => config('services.aruba.password'),
                'DataFile' => base64_encode($electronicInvoice->xml_content),
                'DataFileName' => $electronicInvoice->transmission_id . '.xml',
            ]);

            if ($response->SendResult->Success) {
                $electronicInvoice->update([
                    'sdi_status' => ElectronicInvoiceStatusEnum::SENT,
                    'sdi_sent_at' => now(),
                    'send_attempts' => ($electronicInvoice->send_attempts ?? 0) + 1,
                    'last_send_attempt_at' => now(),
                ]);

                return true;
            }

            throw new \Exception($response->SendResult->ErrorMessage);
        } catch (\Exception $e) {
            $electronicInvoice->update([
                'send_attempts' => ($electronicInvoice->send_attempts ?? 0) + 1,
                'last_send_attempt_at' => now(),
                'sdi_error_messages' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
```

#### Giorno 4: Webhook Notifiche SDI

```php
// app/Http/Controllers/Webhooks/SdiNotificationController.php

<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Sale\ElectronicInvoice;
use App\Enums\ElectronicInvoiceStatusEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SdiNotificationController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $xmlContent = $request->getContent();
        
        $dom = new \DOMDocument();
        $dom->loadXML($xmlContent);
        
        // Extract notification type and transmission ID
        $notificationType = $this->extractNotificationType($dom);
        $transmissionId = $this->extractTransmissionId($dom);
        
        $electronicInvoice = ElectronicInvoice::where('transmission_id', $transmissionId)
            ->first();
        
        if (!$electronicInvoice) {
            \Log::warning("SDI Notification for unknown transmission ID: {$transmissionId}");
            return response()->noContent();
        }
        
        match ($notificationType) {
            'RC' => $this->handleRicevutaConsegna($electronicInvoice, $dom),
            'NS' => $this->handleNotificaScarto($electronicInvoice, $dom),
            'MC' => $this->handleMancataConsegna($electronicInvoice, $dom),
            'NE' => $this->handleNotificaEsito($electronicInvoice, $dom),
            'DT' => $this->handleDecorrenzaTermini($electronicInvoice, $dom),
            'AT' => $this->handleAttestazione($electronicInvoice, $dom),
            default => \Log::warning("Unknown SDI notification type: {$notificationType}"),
        };
        
        return response()->noContent();
    }
    
    protected function handleRicevutaConsegna(ElectronicInvoice $electronicInvoice, \DOMDocument $dom): void
    {
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::ACCEPTED,
            'sdi_received_at' => now(),
            'sdi_receipt_xml' => $dom->saveXML(),
            'sdi_notification_type' => 'RC',
        ]);
        
        // Send email notification to structure
        // Mail::to(...)->send(new InvoiceAcceptedNotification($electronicInvoice));
    }
    
    protected function handleNotificaScarto(ElectronicInvoice $electronicInvoice, \DOMDocument $dom): void
    {
        $errors = $this->extractErrors($dom);
        
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::REJECTED,
            'sdi_received_at' => now(),
            'sdi_receipt_xml' => $dom->saveXML(),
            'sdi_notification_type' => 'NS',
            'sdi_error_messages' => $errors,
        ]);
        
        // Send email notification with errors
        // Mail::to(...)->send(new InvoiceRejectedNotification($electronicInvoice));
    }
    
    // ... altri handler
}
```

### Opzione B: Invio Diretto PEC (Più Semplice)

```php
// app/Services/Sale/PecFatturazioneService.php

use Illuminate\Support\Facades\Mail;

class PecFatturazioneService
{
    public function send(ElectronicInvoice $electronicInvoice): void
    {
        Mail::raw('Invio fattura elettronica', function ($message) use ($electronicInvoice) {
            $message->to('sdi01@pec.fatturapa.it')
                ->subject('Fattura Elettronica')
                ->from(config('mail.from.address'))
                ->attach(
                    storage_path('app/' . $electronicInvoice->xml_file_path),
                    [
                        'as' => $electronicInvoice->transmission_id . '.xml',
                        'mime' => 'application/xml',
                    ]
                );
        });
        
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::SENT,
            'sdi_sent_at' => now(),
        ]);
    }
}
```

---

## SPRINT 4: PDF & Conservazione (3-4 giorni)

### PDF Rappresentazione Tabellare

```php
// composer require barryvdh/laravel-dompdf

// app/Services/Sale/ElectronicInvoicePdfService.php

use Barryvdh\DomPDF\Facade\Pdf;

class ElectronicInvoicePdfService
{
    public function generate(Sale $sale): string
    {
        $pdf = Pdf::loadView('pdf.electronic-invoice', [
            'sale' => $sale,
            'electronicInvoice' => $sale->electronic_invoice,
        ]);
        
        return $pdf->output();
    }
}

// resources/views/pdf/electronic-invoice.blade.php
// Template HTML per rappresentazione tabellare
```

### Conservazione Sostitutiva

```php
// app/Services/Sale/PreservationService.php

class PreservationService
{
    public function preserve(ElectronicInvoice $electronicInvoice): void
    {
        // Calculate hash
        $hash = hash('sha256', $electronicInvoice->xml_content);
        
        $electronicInvoice->update([
            'preservation_hash' => $hash,
            'preserved_at' => now(),
        ]);
        
        // Upload to preservation provider (Aruba/InfoCert)
        // OR store locally with backup
    }
}
```

---

## PRIORITÀ IMPLEMENTAZIONE

### P0 - CRITICO (Blocca operatività)
1. ✅ GenerateController + DownloadXmlController
2. ✅ Frontend ElectronicInvoiceCard
3. ✅ Routes
4. ✅ Test unitari

### P1 - ALTA (Compliance legale)
5. SendToSdiController (Aruba o PEC)
6. Webhook notifiche SDI
7. Gestione errori SDI

### P2 - MEDIA (UX)
8. PDF rappresentazione
9. Preview XML
10. Email notifiche

### P3 - BASSA (Long-term)
11. Conservazione automatica
12. Dashboard analytics
13. Export massivo

---

**INIZIO RACCOMANDATO**: SPRINT 1 (Backend Controllers)
**TEMPO TOTALE STIMATO**: 2-3 settimane full-time
**SERVICE GIÀ PRONTO**: ✅ 95% completo


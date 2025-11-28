# Gestione Avanzata Errori SDI

**Data Implementazione**: 13 Novembre 2025  
**Tempo Implementazione**: ~2 ore  
**Status**: ✅ BACKEND COMPLETO - Frontend TODO

## 📋 Cosa è Stato Implementato

### 1. Enum Codici Errore SDI

**File**: `app/Enums/SdiErrorCodeEnum.php`

**Funzionalità**:
- ✅ 70+ codici errore SDI mappati (00200-00473)
- ✅ Metodo `getDescription()` - Descrizione human-readable
- ✅ Metodo `getSuggestion()` - Suggerimento actionable
- ✅ Metodo `getDocumentationLink()` - Link doc ufficiale
- ✅ Metodo `getSeverity()` - Livello severità (critical/high/medium)
- ✅ Metodo `isAutoFixable()` - Detect errori auto-correggibili
- ✅ Metodo `parseFromMessage()` - Estrai codice da messaggio SDI

**Esempio Codici Più Comuni**:

| Codice | Descrizione | Suggerimento |
|--------|-------------|--------------|
| 00404 | P.IVA cessionario non valida | Controlla P.IVA cliente (11 cifre) |
| 00433 | Importi non coerenti | Ricalcola: Imponibile + IVA + Bollo |
| 00423 | Data fattura futura | Usa data corrente o passata |
| 00466 | IVA 0% senza Natura | Aggiungi codice Natura (N4, N2.1, etc.) |
| 00461 | Numero fattura duplicato | Usa nuovo numero progressivo |
| 00441 | CAP non valido | CAP deve essere 5 cifre (estero: 00000) |

### 2. Service Parser Errori

**File**: `app/Services/Sale/SdiErrorParserService.php`

**Metodi Principali**:

#### `parseErrors(string $errorMessages): Collection`
Parsa messaggi errore SDI e ritorna collection strutturata:
```php
[
    'code' => SdiErrorCodeEnum,
    'raw_message' => '00404 - P.IVA non valida',
    'description' => 'Partita IVA cessionario/committente non valida',
    'suggestion' => 'Verifica P.IVA cliente (11 cifre numeriche)',
    'severity' => 'high',
    'auto_fixable' => false,
    'documentation_link' => 'https://...'
]
```

#### `getErrorSummary(string $errorMessages): array`
Riepilogo errori raggruppati per severità:
```php
[
    'total' => 3,
    'critical' => 0,
    'high' => 1,
    'medium' => 2,
    'auto_fixable_count' => 1,
    'has_critical' => false,
    'primary_error' => [...] // Errore principale
]
```

#### `getFixSuggestions(ElectronicInvoice $invoice): array`
Lista suggerimenti actionable ordinati per priorità:
```php
[
    [
        'title' => 'P.IVA non valida',
        'suggestion' => 'Controlla P.IVA cliente...',
        'severity' => 'high',
        'auto_fixable' => false,
        'priority' => 2
    ],
    ...
]
```

#### `canAutoFix(string $errorMessages): bool`
Verifica se TUTTI gli errori sono auto-correggibili.

#### `getUserFriendlyMessage(string $errorMessages): string`
Genera messaggio user-friendly singolo:
```
"❌ Partita IVA cessionario/committente non valida. 
Verifica P.IVA cliente (11 cifre numeriche)."
```

#### `getHtmlErrorReport(string $errorMessages): string`
Genera report HTML formattato con alert Bootstrap.

### 3. Storico Tentativi Invio

**Migration**: `database/migrations/tenant/2025_11_13_232731_create_electronic_invoice_send_attempts_table.php`

**Tabella**: `electronic_invoice_send_attempts`

**Campi**:
- `id` - Primary key
- `electronic_invoice_id` - FK a electronic_invoices
- `attempt_number` - Numero progressivo tentativo (1, 2, 3...)
- `status` - sent, failed, accepted, rejected
- `request_payload` - JSON payload richiesta
- `response_payload` - JSON risposta API
- `error_messages` - Errori SDI parsati
- `external_id` - ID provider (se inviato con successo)
- `sent_at` - Timestamp invio
- `user_id` - Chi ha fatto l'invio
- `created_at`, `updated_at`

**Indexes**:
- `(electronic_invoice_id, sent_at)` - Per query storico
- `status` - Per filtri

### 4. Model ElectronicInvoiceSendAttempt

**File**: `app/Models/Sale/ElectronicInvoiceSendAttempt.php`

**Fillable**: Tutti i campi necessari

**Casts**:
- `request_payload` → array
- `response_payload` → array
- `sent_at` → datetime

**Relazioni**:
- `electronicInvoice()` - BelongsTo
- `user()` - BelongsTo (chi ha fatto l'invio)

**Metodi Helper**:
- `wasSuccessful()` - Verifica se tentativo è riuscito
- `getParsedErrors()` - Ritorna errori parsati con SdiErrorParserService

### 5. Integrazione Service API

**File**: `app/Services/Sale/FatturaElettronicaApiService.php`

**Modifiche al metodo `send()`**:

**Prima di Inviare**:
```php
$attemptNumber = ($electronicInvoice->send_attempts ?? 0) + 1;
```

**Dopo Successo**:
```php
ElectronicInvoiceSendAttempt::create([
    'electronic_invoice_id' => $electronicInvoice->id,
    'attempt_number' => $attemptNumber,
    'status' => 'sent',
    'request_payload' => ['endpoint' => ...],
    'response_payload' => $data,
    'external_id' => $data['id'],
    'sent_at' => now(),
    'user_id' => auth()->id(),
]);
```

**Dopo Fallimento**:
```php
ElectronicInvoiceSendAttempt::create([
    'electronic_invoice_id' => $electronicInvoice->id,
    'attempt_number' => $attemptNumber,
    'status' => 'failed',
    'error_messages' => $e->getMessage(),
    'sent_at' => now(),
    'user_id' => auth()->id(),
]);
```

### 6. Relazione Model ElectronicInvoice

**File**: `app/Models/Sale/ElectronicInvoice.php`

**Nuova Relazione**:
```php
public function sendAttempts()
{
    return $this->hasMany(ElectronicInvoiceSendAttempt::class)
        ->orderByDesc('sent_at');
}
```

**Uso**:
```php
$invoice = ElectronicInvoice::with('sendAttempts')->find(1);
$attempts = $invoice->sendAttempts; // Collection ordinata per data
$lastAttempt = $invoice->sendAttempts()->first();
```

---

## 🎯 Casi d'Uso

### Caso 1: Fattura Rifiutata - Parsing Automatico

```php
$invoice = ElectronicInvoice::find($id);
$parser = app(SdiErrorParserService::class);

// Messaggio SDI raw:
// "00404 - Partita IVA cessionario non valida;00441 - CAP non valido"

// Parse automatico
$errors = $parser->parseErrors($invoice->sdi_error_messages);

// Result:
// Collection di 2 errori con descrizione, suggestion, severity, etc.
```

### Caso 2: Suggerimenti Utente

```php
$parser = app(SdiErrorParserService::class);
$suggestions = $parser->getFixSuggestions($invoice);

// Result:
/*
[
    [
        'title' => 'P.IVA non valida',
        'suggestion' => 'Verifica P.IVA cliente (11 cifre)',
        'severity' => 'high',
        'priority' => 2
    ],
    [
        'title' => 'CAP non valido',
        'suggestion' => 'CAP deve essere 5 cifre',
        'severity' => 'medium',
        'priority' => 1
    ]
]
*/
```

### Caso 3: Storico Tentativi

```php
$invoice = ElectronicInvoice::with(['sendAttempts.user'])->find($id);

foreach ($invoice->sendAttempts as $attempt) {
    echo "Tentativo #{$attempt->attempt_number}\n";
    echo "Data: {$attempt->sent_at}\n";
    echo "User: {$attempt->user->name}\n";
    echo "Status: {$attempt->status}\n";
    
    if ($attempt->status === 'failed') {
        $errors = $attempt->getParsedErrors();
        foreach ($errors as $error) {
            echo "  - {$error['description']}\n";
            echo "    💡 {$error['suggestion']}\n";
        }
    }
}
```

### Caso 4: Dashboard Admin - Errori Comuni

```php
$parser = app(SdiErrorParserService::class);
$commonErrors = $parser->getMostCommonErrors();

/*
[
    [
        'code' => '00404',
        'description' => 'P.IVA cessionario non valida',
        'frequency' => 'Molto Comune',
        'quick_fix' => 'Controlla P.IVA cliente (11 cifre)'
    ],
    ...
]
*/
```

---

## 🚀 TODO Frontend (Non Implementato)

### 1. Componente Visualizzazione Errori

**File da Creare**: `resources/js/components/electronic-invoice/SdiErrorsPanel.tsx`

**Funzionalità Richieste**:
- ✅ Lista errori con badge severity (red=critical, orange=high, blue=medium)
- ✅ Collapse/Expand per ogni errore
- ✅ Icone: ⚠️ critical, ⚙️ auto-fixable, 📄 link docs
- ✅ Suggerimenti actionable con highlight
- ✅ Link "Vai alla documentazione"

**Mockup**:
```tsx
<SdiErrorsPanel errors={parsedErrors}>
  <ErrorItem severity="high">
    <ErrorCode>00404</ErrorCode>
    <ErrorTitle>P.IVA cessionario non valida</ErrorTitle>
    <ErrorSuggestion>
      💡 Verifica P.IVA cliente (11 cifre numeriche)
    </ErrorSuggestion>
    <ErrorActions>
      <Button>Correggi Cliente</Button>
      <Link href="...">Documentazione</Link>
    </ErrorActions>
  </ErrorItem>
</SdiErrorsPanel>
```

### 2. Storico Tentativi Timeline

**File da Creare**: `resources/js/components/electronic-invoice/SendAttemptsTimeline.tsx`

**Funzionalità**:
- ✅ Timeline verticale con tentativi ordinati per data
- ✅ Icon status (✅ sent, ❌ failed, 🔄 pending)
- ✅ Collapse per vedere payload request/response
- ✅ User avatar + nome chi ha fatto l'invio
- ✅ Expand errori per tentativo fallito

**Mockup**:
```tsx
<SendAttemptsTimeline attempts={invoice.send_attempts}>
  <TimelineItem>
    <TimelineDot status="failed" />
    <TimelineContent>
      <TimelineHeader>
        Tentativo #2 - Failed
        <TimelineDate>13 Nov 2025, 18:30</TimelineDate>
      </TimelineHeader>
      <TimelineUser>da Mario Rossi</TimelineUser>
      <TimelineErrors>
        <ErrorBadge>00404</ErrorBadge> P.IVA non valida
      </TimelineErrors>
    </TimelineContent>
  </TimelineItem>
</SendAttemptsTimeline>
```

### 3. Workflow "Correggi e Reinvia"

**Controller da Creare**: `app/Http/Controllers/Application/Sales/ElectronicInvoice/RetryAfterFixController.php`

**Route**:
```php
POST /sales/{sale}/electronic-invoice/retry
```

**Funzionalità**:
1. Valida che la fattura sia stata rifiutata
2. Verifica che siano passati almeno N minuti dall'ultimo tentativo
3. Rigenerazione XML (se necessario)
4. Invio nuovo tentativo
5. Redirect con messaggio successo/errore

**Frontend Button**:
```tsx
<Button 
  onClick={handleRetry} 
  disabled={!canRetry}
  loading={retrying}
>
  🔄 Correggi e Reinvia
</Button>
```

---

## 📊 Statistiche Errori (Dashboard Admin - TODO)

**Widget Dashboard**: `ElectronicInvoiceErrorsWidget`

**Metriche**:
- Totale fatture rifiutate questo mese
- Top 5 errori più frequenti
- % fatture corrette al primo invio vs retry
- Tempo medio correzione/reinvio

**Query Example**:
```php
// Top errori
$topErrors = ElectronicInvoice::whereNotNull('sdi_error_messages')
    ->get()
    ->flatMap(fn($inv) => $parser->parseErrors($inv->sdi_error_messages))
    ->groupBy('code')
    ->map->count()
    ->sortDesc()
    ->take(5);

// Tasso successo primo invio
$totalInvoices = ElectronicInvoice::count();
$successFirstAttempt = ElectronicInvoice::where('send_attempts', 1)
    ->where('sdi_status', 'accepted')
    ->count();
$successRate = ($successFirstAttempt / $totalInvoices) * 100;
```

---

## 🧪 Testing

### Test Manuale

```bash
# 1. Crea fattura con errore intenzionale (es: P.IVA cliente invalida)
php artisan tinker
$sale = Sale::first();
$sale->customer->update(['vat_number' => '12345']); // P.IVA invalida!
exit

# 2. Genera e invia fattura
# → SDI risponderà con errore 00404

# 3. Verifica parsing automatico
php artisan tinker
$invoice = ElectronicInvoice::latest()->first();
$parser = app(\App\Services\Sale\SdiErrorParserService::class);
$errors = $parser->parseErrors($invoice->sdi_error_messages);
dd($errors->toArray());
exit

# 4. Verifica storico tentativi
php artisan tinker
$invoice = ElectronicInvoice::with('sendAttempts')->latest()->first();
dd($invoice->sendAttempts->toArray());
exit
```

### Test Automatico (TODO)

```php
// tests/Feature/SdiErrorParserTest.php

test('parses P.IVA error correctly', function () {
    $parser = new SdiErrorParserService();
    $message = '00404 - Partita IVA cessionario non valida';
    
    $errors = $parser->parseErrors($message);
    
    expect($errors)->toHaveCount(1);
    expect($errors->first()['code'])->toBe(SdiErrorCodeEnum::FORMAT_00404);
    expect($errors->first()['severity'])->toBe('high');
    expect($errors->first()['suggestion'])->toContain('11 cifre');
});

test('identifies auto-fixable errors', function () {
    $parser = new SdiErrorParserService();
    $message = '00302 - FormatoTrasmissione non valido';
    
    expect($parser->canAutoFix($message))->toBeTrue();
});

test('tracks send attempts', function () {
    $invoice = ElectronicInvoice::factory()->create();
    
    // Simula invio fallito
    $invoice->sendAttempts()->create([
        'attempt_number' => 1,
        'status' => 'failed',
        'error_messages' => '00404 - P.IVA non valida',
        'sent_at' => now(),
    ]);
    
    expect($invoice->sendAttempts)->toHaveCount(1);
    expect($invoice->sendAttempts->first()->wasSuccessful())->toBeFalse();
});
```

---

## 📝 Documentazione Ufficiale SDI

**Link Utili**:
- [Codici Esito FatturaPA](https://www.agenziaentrate.gov.it/portale/documents/20143/233439/Codici+degli+esiti+FatturaPA_+28112014.pdf)
- [Specifiche Tecniche v1.9](https://www.fatturapa.gov.it/it/norme-e-regole/documentazione-fattura-ordinaria/)
- [FAQ Agenzia Entrate](https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/fatturazione-elettronica/faq)

---

## ✅ Riepilogo Implementazione

| Componente | Status | Note |
|------------|--------|------|
| Enum Codici Errore | ✅ 100% | 70+ codici mappati |
| Service Parser | ✅ 100% | Parsing + suggerimenti completi |
| Storico Tentativi DB | ✅ 100% | Migration + Model |
| Integration API Service | ✅ 100% | Tracking automatico tentativi |
| Frontend UI Errori | ⏸️ 0% | TODO |
| Workflow Retry | ⏸️ 0% | TODO |
| Dashboard Stats | ⏸️ 0% | TODO |
| Testing Automatico | ⏸️ 0% | TODO |

**Backend**: ✅ **100% COMPLETO**  
**Frontend**: ⏸️ **0% - Da Implementare**

---

**Implementato da**: GitHub Copilot  
**Data**: 13 Novembre 2025  
**Tempo Backend**: ~2 ore  
**Tempo Frontend Stimato**: ~2-3 ore


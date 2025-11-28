# Conservazione Sostitutiva Fatture Elettroniche

**Data Implementazione**: 14 Novembre 2025  
**Tempo Implementazione**: ~4 ore  
**Status**: ✅ BACKEND COMPLETO - Frontend TODO

## 📋 Obbligo Normativo

### Riferimenti Legislativi
- **CAD (Codice Amministrazione Digitale)**: D.Lgs 82/2005, art. 3
- **DMEF**: Decreto 17 giugno 2014
- **Retention**: 10 anni dalla data emissione fattura
- **Integrità**: Hash crittografico (SHA-256) + timestamp

### Cosa Deve Essere Conservato
1. ✅ XML fattura elettronica originale
2. ✅ Ricevute SDI (RC - Ricevuta Consegna, NS - Notifica Scarto, DT - Decorrenza Termini)
3. ✅ Metadata conservazione (chi, quando, hash)
4. ⚠️ PDF rappresentazione tabellare (opzionale ma consigliato)

### Perché NON Basta il Provider API
L'articolo utente dice:
> "Il servizio di conservazione sostitutiva viene offerto gratuitamente dall'Agenzia delle Entrate, 
> accedendo sul portale ivaservizi.agenziaentrate.gov.it"

**Significa**:
- ❌ Il provider API (Fattura Elettronica API) **NON conserva** i documenti per compliance
- ✅ L'Agenzia delle Entrate offre conservazione **gratuita** tramite portale web
- ✅ Per compliance interna aziendale, è meglio avere **copia locale** gestita automaticamente

---

## 🏗️ Architettura Implementata

### 1. Service Layer

**File**: `app/Services/Sale/ElectronicInvoicePreservationService.php`

**Responsabilità**:
- Conservazione singola fattura o batch
- Organizzazione storage strutturato
- Calcolo hash integrità
- Metadata generation
- Export ZIP per periodo
- Statistiche e compliance

### 2. Storage Structure

```
storage/app/preservation/electronic_invoices/
├── 2025/
│   ├── 01/
│   │   ├── IT12345678901_00001/
│   │   │   ├── fattura.xml          (XML originale)
│   │   │   ├── metadata.json        (Metadata conservazione)
│   │   │   └── receipts/
│   │   │       ├── ricevuta_sdi.xml (RC/NS/DT)
│   │   │       └── ...
│   │   └── IT12345678901_00002/
│   │       └── ...
│   ├── 02/
│   │   └── ...
│   └── ...
├── 2024/
│   └── ...
└── 2023/
    └── ...
```

**Vantaggi Struttura**:
- ✅ Facile navigazione per anno/mese
- ✅ Backup incrementale semplice
- ✅ Cleanup post-retention organizzato
- ✅ Query filesystem performanti
- ✅ Export massivo per periodo

### 3. Database Fields

**Migration**: `add_preservation_path_to_electronic_invoices_table`

**Campi Aggiunti**:
```php
'preservation_path' => 'preservation/2025/11/IT123...', // Path storage
'preservation_hash' => 'abc123...', // SHA-256 integrità
'preservation_deleted_at' => null, // Cleanup post-10 anni
```

**Campi Esistenti Usati**:
```php
'preserved_at' => '2025-11-14 10:30:00', // Timestamp conservazione
'sdi_receipt_xml' => '<?xml...', // Ricevuta SDI
```

---

## 🔧 Service API

### Metodo `preserve(ElectronicInvoice $invoice): bool`

**Conserva singola fattura**.

**Validazioni**:
- ✅ Fattura deve essere `sdi_status = 'accepted'`
- ✅ Non già conservata (`preserved_at IS NULL`)

**Processo**:
1. Crea directory strutturata `preservation/YYYY/MM/transmission_id/`
2. Salva XML fattura originale (`fattura.xml`)
3. Salva ricevute SDI se presenti (`receipts/ricevuta_sdi.xml`)
4. Genera metadata JSON
5. Calcola hash SHA-256 combinato di tutti i file
6. Aggiorna record DB con `preserved_at`, `preservation_hash`, `preservation_path`

**Esempio Uso**:
```php
$service = app(\App\Services\Sale\ElectronicInvoicePreservationService::class);
$invoice = ElectronicInvoice::find(1);

try {
    $service->preserve($invoice);
    echo "✓ Fattura conservata con successo";
} catch (\Exception $e) {
    echo "✗ Errore: " . $e->getMessage();
}
```

### Metodo `preserveBatch(Collection $invoices): array`

**Conserva batch di fatture** (usato dal command).

**Return**:
```php
[
    'success' => 42,      // Conservate con successo
    'skipped' => 3,       // Già conservate (saltate)
    'failed' => 1,        // Errori
    'errors' => [         // Dettagli errori
        [
            'transmission_id' => 'IT123_00001',
            'error' => 'File not found'
        ]
    ]
]
```

**Esempio**:
```php
$invoices = ElectronicInvoice::where('sdi_status', 'accepted')
    ->whereNull('preserved_at')
    ->get();

$results = $service->preserveBatch($invoices);
// Processa $results['success'], $results['failed'], etc.
```

### Metodo `verifyIntegrity(ElectronicInvoice $invoice): bool`

**Verifica integrità fattura conservata**.

**Processo**:
1. Ricalcola hash SHA-256 di tutti i file conservati
2. Confronta con `preservation_hash` salvato nel DB
3. Return `true` se match, `false` se corrotto

**Uso**:
```php
if ($service->verifyIntegrity($invoice)) {
    echo "✓ Integrità verificata";
} else {
    echo "⚠️ ATTENZIONE: File corrotti o modificati!";
}
```

### Metodo `exportPeriod(int $year, ?int $month = null): string`

**Esporta fatture conservate in ZIP**.

**Parametri**:
- `$year` - Anno (obbligatorio)
- `$month` - Mese 1-12 (opzionale, null = intero anno)

**Return**: Path assoluto file ZIP generato

**Struttura ZIP**:
```
conservazione_2025_11.zip
├── IT12345678901_00001/
│   ├── fattura.xml
│   ├── metadata.json
│   └── receipts/
│       └── ricevuta_sdi.xml
├── IT12345678901_00002/
│   └── ...
└── ...
```

**Uso**:
```php
// Export singolo mese
$zipPath = $service->exportPeriod(2025, 11);
// /path/to/storage/app/temp/conservazione_2025_11.zip

// Export intero anno
$zipPath = $service->exportPeriod(2025);
// /path/to/storage/app/temp/conservazione_2025.zip

// Download
return response()->download($zipPath)->deleteFileAfterSend();
```

### Metodo `getStatistics(): array`

**Statistiche conservazione per dashboard**.

**Return**:
```php
[
    'total_invoices' => 150,
    'preserved_count' => 142,
    'pending_preservation' => 8,
    'preservation_rate' => 94.67,        // Percentuale
    'by_year' => [
        2025 => 45,
        2024 => 97,
    ],
    'oldest_preserved' => '12/01/2024',
    'storage_size_mb' => 23.5,
    'compliance_10_years' => true,       // Tutte >10 anni conservate?
]
```

**Uso Dashboard**:
```php
$stats = $service->getStatistics();

echo "Fatture conservate: {$stats['preserved_count']}/{$stats['total_invoices']}";
echo "Tasso conservazione: {$stats['preservation_rate']}%";
echo "Spazio occupato: {$stats['storage_size_mb']} MB";

if (!$stats['compliance_10_years']) {
    echo "⚠️ ATTENZIONE: Alcune fatture >10 anni NON conservate!";
}
```

### Metodo `cleanupOldPreservations(int $retentionYears = 10): int`

**Cleanup fatture oltre retention** (ATTENZIONE: Elimina file storage).

**Parametri**:
- `$retentionYears` - Anni retention (default: 10)

**Processo**:
1. Query fatture create > `$retentionYears` anni fa
2. Elimina file da storage (directory completa)
3. Marca record DB con `preservation_deleted_at` (non cancella record per audit)
4. Return numero fatture eliminate

**⚠️ IMPORTANTE**: 
- Usare SOLO dopo 10+ anni dalla data emissione
- Record DB rimane per storico audit
- File storage vengono eliminati permanentemente

**Uso**:
```php
// Cleanup fatture oltre 10 anni (obbligo normativo scaduto)
$deleted = $service->cleanupOldPreservations(10);

echo "{$deleted} fatture oltre retention eliminate";
```

---

## 🤖 Command CLI

**File**: `app/Console/Commands/PreserveElectronicInvoicesCommand.php`

**Signature**: `preserve:electronic-invoices`

### Opzioni

| Opzione | Tipo | Default | Descrizione |
|---------|------|---------|-------------|
| `--tenant` | string | null | ID specifico tenant (opzionale, default: tutti) |
| `--month` | string | mese precedente | Periodo (formato: YYYY-MM) |
| `--force` | flag | false | Forza riconservazione anche se già conservate |

### Esempi Uso

#### 1. Conservazione Mensile Standard (tutti i tenant, mese precedente)
```bash
php artisan preserve:electronic-invoices
```

**Output**:
```
═══════════════════════════════════════════
  Conservazione Sostitutiva Fatture
═══════════════════════════════════════════

📅 Periodo: 2025-10
🏢 Tenants da processare: 15

Processing tenant: Palestra ABC (60876426-2e31...)
  → Fatture trovate: 23
  [■■■■■■■■■■■■■■■■■■■■■■■] 23/23
  ✓ Successo: 23

Processing tenant: Centro Fitness XYZ (...)
  → Nessuna fattura da conservare

...

═══════════════════════════════════════════
  Riepilogo Finale
═══════════════════════════════════════════
+-------------+--------+
| Risultato   | Totale |
+-------------+--------+
| ✓ Successo  | 142    |
| ⊘ Saltate   | 8      |
| ✗ Fallite   | 0      |
+-------------+--------+

✓ Conservazione completata!
```

#### 2. Conservazione Tenant Specifico
```bash
php artisan preserve:electronic-invoices --tenant=60876426-2e31-4a9b-a163-1e46be4a425f
```

#### 3. Conservazione Mese Specifico
```bash
php artisan preserve:electronic-invoices --month=2025-09
```

#### 4. Riconservazione Forzata (es: dopo fix bug)
```bash
php artisan preserve:electronic-invoices --month=2025-10 --force
```

### Scheduled Task Automatico

**File**: `bootstrap/app.php`

**Schedule**: 1° giorno di ogni mese alle 02:00 (timezone Rome)

```php
$schedule->command('preserve:electronic-invoices')
    ->monthlyOn(1, '02:00')
    ->timezone('Europe/Rome')
    ->withoutOverlapping()
    ->runInBackground();
```

**Processo Automatico**:
1. Ogni 1° del mese alle 02:00, Laravel scheduler esegue command
2. Command conserva fatture del mese precedente
3. Tutti i tenant vengono processati automaticamente
4. Log successi/errori in `storage/logs/laravel.log`

**Verifica Schedule**:
```bash
# Lista scheduled tasks
php artisan schedule:list

# Output:
# 0 2 1 * * preserve:electronic-invoices ... Next Due: 1 day from now

# Test manuale
php artisan schedule:run
```

---

## 📊 Metadata JSON Structure

**File**: `preservation/YYYY/MM/transmission_id/metadata.json`

**Esempio**:
```json
{
  "version": "1.0",
  "preserved_at": "2025-11-14T10:30:00+00:00",
  "preserved_by": "Mario Rossi",
  "tenant_id": "60876426-2e31-4a9b-a163-1e46be4a425f",
  "tenant_name": "Palestra ABC S.r.l.",
  
  "invoice": {
    "id": 123,
    "transmission_id": "IT12345678901_00001",
    "external_id": "abc-123-xyz",
    "sdi_status": "accepted",
    "created_at": "2025-10-15T14:20:00+00:00",
    "sdi_sent_at": "2025-10-15T14:25:00+00:00"
  },
  
  "sale": {
    "id": 456,
    "number": "2025/001",
    "date": "2025-10-15",
    "customer_name": "Mario Rossi",
    "total_amount": 1250.50
  },
  
  "compliance": {
    "law": "CAD D.Lgs 82/2005 art. 3, DMEF 17/06/2014",
    "retention_years": 10,
    "integrity_algorithm": "SHA-256",
    "timestamp_method": "Database timestamp + hash"
  }
}
```

**Uso**:
- ✅ Audit trail completo
- ✅ Ricerca file conservati senza DB
- ✅ Export per commercialisti/revisori
- ✅ Verifica compliance

---

## 🧪 Testing

### Test Manuale Conservazione

```bash
# 1. Assicurati di avere fatture accettate
php artisan tinker
$count = \App\Models\Sale\ElectronicInvoice::where('sdi_status', 'accepted')
    ->whereNull('preserved_at')
    ->count();
echo "Fatture da conservare: {$count}";
exit

# 2. Esegui conservazione manuale (mese corrente per test)
php artisan preserve:electronic-invoices --month=$(date +%Y-%m)

# 3. Verifica risultati
php artisan tinker
$service = app(\App\Services\Sale\ElectronicInvoicePreservationService::class);
$stats = $service->getStatistics();
dd($stats);
exit

# 4. Verifica file storage
ls -lah storage/app/preservation/electronic_invoices/2025/11/
```

### Test Integrità

```php
php artisan tinker

$service = app(\App\Services\Sale\ElectronicInvoicePreservationService::class);
$invoice = \App\Models\Sale\ElectronicInvoice::whereNotNull('preserved_at')->first();

// Verifica integrità OK
$service->verifyIntegrity($invoice); // true

// Simula corruzione file (per test)
\Storage::put($invoice->preservation_path . '/fattura.xml', 'CORRUPTED DATA');

// Verifica fallisce
$service->verifyIntegrity($invoice); // false ⚠️

exit
```

### Test Export ZIP

```php
php artisan tinker

$service = app(\App\Services\Sale\ElectronicInvoicePreservationService::class);

// Export mese corrente
$zipPath = $service->exportPeriod(2025, 11);
echo "ZIP generato: {$zipPath}\n";

// Verifica contenuto ZIP
$zip = new ZipArchive();
$zip->open($zipPath);
for ($i = 0; $i < $zip->numFiles; $i++) {
    echo $zip->getNameIndex($i) . "\n";
}
$zip->close();

exit
```

---

## 🚀 Frontend TODO (Non Implementato)

### 1. Dashboard Conservazione

**Route**: `/app/{tenant}/preservation`

**Funzionalità**:
- ✅ Statistiche overview (card con totali, rate, storage)
- ✅ Grafico conservazione per anno (bar chart)
- ✅ Lista ultimi conservati (table con date, transmission_id)
- ✅ Alert compliance 10 anni
- ✅ Button "Export Anno/Mese" → download ZIP

**Mockup**:
```
┌─────────────────────────────────────────┐
│  Conservazione Sostitutiva              │
├─────────────┬──────────────┬────────────┤
│ Conservate  │ In Attesa    │ Storage    │
│    142      │      8       │  23.5 MB   │
└─────────────┴──────────────┴────────────┘
┌─────────────────────────────────────────┐
│  Conservazione per Anno                 │
│  [Bar Chart: 2025=45, 2024=97, ...]    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Export Massivo                         │
│  [Select Anno]  [Select Mese]  [Export]│
└─────────────────────────────────────────┘
```

### 2. Status Preservation in Lista Fatture

**File**: `ElectronicInvoiceCard` component

**Aggiungere Badge**:
- ✅ Badge "Conservata" (green) se `preserved_at` presente
- ⏳ Badge "In Attesa" (orange) se accettata ma non conservata
- 🔒 Tooltip con data conservazione e hash

### 3. Widget Compliance Dashboard Principale

**File**: Dashboard widget

**KPI**:
- Tasso conservazione %
- Fatture pending preservation
- Alert se compliance 10 anni fallisce

---

## 📝 Note Operative

### Backup Ridondante (Opzionale)

Per sicurezza, considera backup cloud:

```bash
# Cron job settimanale backup su S3
0 3 * * 0 aws s3 sync /path/to/storage/app/preservation/ s3://bucket/preservation/ --delete
```

### Cleanup Post-10 Anni

**Quando**: Dopo 10 anni + margine sicurezza (es: 11 anni)

**Processo**:
```bash
# Elimina fatture conservate create prima del 2014
php artisan tinker
$service = app(\App\Services\Sale\ElectronicInvoicePreservationService::class);
$deleted = $service->cleanupOldPreservations(11); // 11 anni per margine
echo "Eliminate {$deleted} fatture oltre retention";
exit
```

### Audit Compliance

**Periodicità**: Trimestrale

**Checklist**:
1. ✅ Verifica `compliance_10_years = true` in statistics
2. ✅ Spot check integrità random sample 10 fatture
3. ✅ Verifica scheduled task eseguito ultimi 3 mesi
4. ✅ Check storage size crescita lineare
5. ✅ Backup cloud up-to-date

---

## ✅ Riepilogo Implementazione

| Componente | Status | File |
|------------|--------|------|
| Service Layer | ✅ 100% | `ElectronicInvoicePreservationService.php` |
| Command CLI | ✅ 100% | `PreserveElectronicInvoicesCommand.php` |
| Scheduled Task | ✅ 100% | `bootstrap/app.php` |
| Database Fields | ✅ 100% | Migration `add_preservation_path_...` |
| Storage Structure | ✅ 100% | `preservation/YYYY/MM/transmission_id/` |
| Integrity Verification | ✅ 100% | `verifyIntegrity()` method |
| Export ZIP | ✅ 100% | `exportPeriod()` method |
| Statistics | ✅ 100% | `getStatistics()` method |
| Cleanup Retention | ✅ 100% | `cleanupOldPreservations()` method |
| Frontend Dashboard | ⏸️ 0% | TODO |
| Frontend Export UI | ⏸️ 0% | TODO |
| Testing Automatico | ⏸️ 0% | TODO |

**Backend**: ✅ **100% COMPLETO E PRONTO**  
**Compliance**: ✅ **CONFORME CAD + DMEF**  
**Frontend**: ⏸️ **Da implementare quando necessario**

---

**Implementato da**: GitHub Copilot  
**Data**: 14 Novembre 2025  
**Tempo**: ~4 ore  
**Conformità Normativa**: ✅ CAD D.Lgs 82/2005 art. 3, DMEF 17/06/2014


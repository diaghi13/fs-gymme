# 📋 Sales & Documents Architecture Refactoring

## 🎯 Obiettivo

Separare correttamente i **documenti fiscali/gestionali** dai **file allegati** per una architettura più pulita e scalabile.

---

## 🚨 Problema Attuale (Novembre 2025)

### Confusione Naming e Responsabilità

**Tabella `documents`** (attualmente):
- Usata per documenti scannerizzati/caricati (PDF, immagini, contratti)
- NON per documenti fiscali (fatture, DDT, preventivi)

**Tabella `sales`**:
- Ha `document_type_id` → Dovrebbe essere in una tabella `fiscal_documents`
- Ha `document_type_electronic_invoice_id` → Specifico per FE
- Mescola logica "vendita" con "documento fiscale"

**Problema**:
- `document_type_id` si riferisce a DocumentType (Fattura, DDT, Preventivo)
- Ma `documents` table è per file uploadati, non documenti fiscali
- Naming confuso: "documento" significa due cose diverse

---

## ✅ Quick Fix Applicato (11 Novembre 2025)

**Per sbloccare subito la vendita**:

1. ✅ `document_type_id` reso **nullable** in `sales`
2. ✅ `SaleService` salva solo `document_type_electronic_invoice_id` dal frontend
3. ✅ `StoreSaleRequest` valida `exists:document_type_electronic_invoices,id`
4. ✅ Config database tenant dev per accesso rapido
5. ✅ Frontend già corretto (invia `document_type_electronic_invoice_id`)

**Risultato**: Vendita funziona, `document_type_id` NULL per ora (tech debt documentato).

---

## 🏗️ Architettura Futura (Refactoring)

### Fase 1: Rinominare Tabella Allegati

**Obiettivo**: Liberare il nome "documents" per uso fiscale

**Actions**:
```bash
# Migration 1: Rinomina documents → uploaded_files
php artisan make:migration rename_documents_to_uploaded_files --path=database/migrations/tenant

# Migration 2: Rinomina tabelle correlate
- document_installments → uploaded_file_installments (se applicabile)
- document_items → uploaded_file_items (se applicabile)
- document_notes → uploaded_file_notes (se applicabile)
- document_rows → uploaded_file_rows (se applicabile)
- document_worksite → uploaded_file_worksite (se applicabile)
```

**Models da rinominare**:
- `App\Models\Document` → `App\Models\UploadedFile`
- Aggiornare relationships in tutti i model che usano `documents()`

**Tempo stimato**: 2-3 ore

---

### Fase 2: Creare Tabella Fiscal Documents

**Obiettivo**: Separare documenti fiscali/gestionali

**Schema proposto**:
```php
Schema::create('fiscal_documents', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();

    $table->foreignId('structure_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();

    // Tipo documento gestionale (Fattura, DDT, Preventivo, Nota Credito)
    $table->foreignId('document_type_id')
        ->constrained('document_types')
        ->cascadeOnUpdate()
        ->restrictOnDelete();

    // Codice fatturazione elettronica (TD01-TD29, solo per fatture)
    $table->foreignId('document_type_electronic_invoice_id')
        ->nullable()
        ->constrained('document_type_electronic_invoices')
        ->cascadeOnUpdate()
        ->restrictOnDelete();

    // Numerazione
    $table->string('progressive_number', 50);
    $table->string('progressive_number_prefix', 10)->nullable();
    $table->integer('progressive_number_value');
    $table->integer('year');

    // Date
    $table->timestamp('date');
    $table->timestamp('issue_date')->nullable();
    $table->timestamp('due_date')->nullable();

    // Soggetti
    $table->foreignId('customer_id')->nullable()->constrained()->cascadeOnUpdate()->restrictOnDelete();
    $table->foreignId('supplier_id')->nullable()->constrained()->cascadeOnUpdate()->restrictOnDelete();

    // Condizioni commerciali
    $table->foreignId('payment_condition_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
    $table->foreignId('financial_resource_id')->nullable()->constrained()->cascadeOnUpdate()->restrictOnDelete();
    $table->foreignId('promotion_id')->nullable()->constrained()->cascadeOnUpdate()->restrictOnDelete();

    // Importi
    $table->integer('subtotal')->default(0); // centesimi
    $table->integer('discount_percentage')->nullable();
    $table->integer('discount_absolute')->nullable();
    $table->integer('tax_total')->default(0);
    $table->integer('total')->default(0);

    // Stati
    $table->string('status')->default('draft'); // draft, saved, sent, cancelled
    $table->string('payment_status')->default('not_paid');
    $table->string('accounting_status')->default('not_accounted');
    $table->string('exported_status')->default('not_exported');

    // Fatturazione Elettronica (solo per fatture)
    $table->string('electronic_invoice_status')->nullable();
    $table->string('sdi_transmission_id', 50)->nullable()->unique();
    $table->timestamp('sdi_sent_at')->nullable();
    $table->timestamp('sdi_received_at')->nullable();
    $table->string('sdi_notification_type', 10)->nullable();
    $table->text('sdi_notification_message')->nullable();
    $table->string('electronic_invoice_xml_path')->nullable();

    // Ritenute e bolli (fatture professionisti)
    $table->integer('withholding_tax_amount')->nullable();
    $table->decimal('withholding_tax_rate', 5, 2)->nullable();
    $table->string('withholding_tax_type', 10)->nullable();
    $table->integer('stamp_duty_amount')->nullable();

    // Cassa previdenziale
    $table->string('welfare_fund_type', 10)->nullable();
    $table->decimal('welfare_fund_rate', 5, 2)->nullable();
    $table->integer('welfare_fund_amount')->nullable();
    $table->integer('welfare_fund_taxable_amount')->nullable();
    $table->foreignId('welfare_fund_vat_rate_id')->nullable()->constrained('vat_rates');

    // Note e causali
    $table->text('description')->nullable();
    $table->text('causale')->nullable();
    $table->longText('notes')->nullable();

    // Collegamenti
    $table->foreignId('original_document_id')->nullable()->constrained('fiscal_documents'); // Per note credito
    $table->string('original_document_type')->nullable(); // Tipo documento originale

    // Metadata
    $table->string('currency')->default('EUR');
    $table->timestamp('fiscal_retention_until')->nullable();

    $table->timestamps();
    $table->softDeletes();

    // Indexes
    $table->index(['structure_id', 'year', 'progressive_number']);
    $table->index(['customer_id', 'date']);
    $table->index(['status', 'payment_status']);
});
```

**Tempo stimato**: 2 ore

---

### Fase 3: Migrare Logica da Sales

**Obiettivo**: `Sale` diventa un tipo specifico di `FiscalDocument`

**Opzioni**:

#### Opzione 3A: Single Table Inheritance (STI)
```php
// fiscal_documents table con campo "type"
type: 'sale', 'invoice', 'quote', 'ddt', 'credit_note'

// Models
App\Models\FiscalDocument (base)
  ├─ App\Models\Sale (extends FiscalDocument)
  ├─ App\Models\Invoice (extends FiscalDocument)
  ├─ App\Models\Quote (extends FiscalDocument)
  └─ App\Models\CreditNote (extends FiscalDocument)
```

**Pro**:
- Un'unica tabella per tutti i documenti
- Facile query cross-document
- Meno tabelle da gestire

**Contro**:
- Tabella molto larga con molti nullable
- Performance query se cresce molto

---

#### Opzione 3B: Polymorphic Relation
```php
// fiscal_documents rimane
// sales, invoices, quotes come tabelle separate
// Relazione: documentable_type + documentable_id

Sale hasOne FiscalDocument (morphOne)
Invoice hasOne FiscalDocument (morphOne)
```

**Pro**:
- Tabelle più snelle
- Ogni tipo ha solo i campi necessari

**Contro**:
- Più complessità relazionale
- Query cross-document più difficili

---

#### Opzione 3C: Sales come Subset di FiscalDocument ⭐ RACCOMANDATO
```php
// fiscal_documents è la tabella principale
// sales diventa una VIEW o rimane come tabella legacy

// Approccio graduale:
1. Nuove vendite → fiscal_documents con type='sale'
2. Vecchie vendite → rimangono in sales (legacy)
3. Gradualmente migrare vecchie → nuove

// Model Sale
class Sale extends Model {
    protected $table = 'fiscal_documents';

    protected static function booted() {
        static::addGlobalScope('type', function ($query) {
            $query->where('type', 'sale');
        });
    }
}
```

**Pro**:
- Migrazione graduale senza breaking changes
- Backward compatibility
- Flessibilità futura

**Contro**:
- Periodo di transizione con dual-system

**Tempo stimato**: 4-6 ore

---

### Fase 4: Aggiornare Frontend

**Files da aggiornare**:
```typescript
// Types
resources/js/types/index.d.ts
  - Aggiornare Sale interface
  - Aggiungere FiscalDocument interface

// Components
resources/js/pages/sales/sale-create.tsx
resources/js/pages/sales/sale-show.tsx
resources/js/components/sales/*.tsx

// Forms
- Aggiungere selezione document_type (oltre a document_type_electronic_invoice)
- Dropdown: Fattura, DDT, Preventivo, Nota Credito
- Logica condizionale: se Fattura → mostra electronic_invoice fields
```

**Tempo stimato**: 3-4 ore

---

### Fase 5: Data Migration Script

**Obiettivo**: Migrare dati esistenti da `sales` a `fiscal_documents`

```php
// database/migrations/tenant/migrate_sales_to_fiscal_documents.php

public function up() {
    DB::transaction(function () {
        // 1. Copia tutte le sales → fiscal_documents
        $sales = DB::table('sales')->get();

        foreach ($sales as $sale) {
            DB::table('fiscal_documents')->insert([
                'uuid' => $sale->uuid,
                'structure_id' => $sale->structure_id,
                'document_type_id' => $sale->document_type_id ?? $this->inferDocumentType($sale),
                'document_type_electronic_invoice_id' => $sale->document_type_electronic_invoice_id,
                'progressive_number' => $sale->progressive_number,
                // ... tutti gli altri campi
                'type' => 'sale',
                'migrated_from_sales_id' => $sale->id,
            ]);
        }

        // 2. Aggiorna foreign keys in sale_rows, payments
        // 3. Backup sales table (rename to sales_legacy)
    });
}

private function inferDocumentType($sale) {
    // Logica per dedurre document_type_id da electronic_invoice_id
    // TD01 → Fattura
    // TD04 → Nota Credito
    // etc.
}
```

**Tempo stimato**: 2 ore

---

## 📋 Checklist Completa Refactoring

### Sprint 1: Preparation (4 ore)
- [ ] Documentare schema attuale completo
- [ ] Creare backup database production
- [ ] Pianificare downtime (se necessario)
- [ ] Preparare rollback strategy

### Sprint 2: Rename Documents (3 ore)
- [ ] Migration: `documents` → `uploaded_files`
- [ ] Rinominare models e relationships
- [ ] Aggiornare controllers e services
- [ ] Test manual upload/download files
- [ ] Git commit: "Rename documents to uploaded_files"

### Sprint 3: Create Fiscal Documents (6 ore)
- [ ] Migration: create `fiscal_documents` table
- [ ] Model `FiscalDocument` con relationships
- [ ] Seeders per document_types (Fattura, DDT, Preventivo)
- [ ] Test creazione documento base
- [ ] Git commit: "Add fiscal_documents table"

### Sprint 4: Migrate Sales Logic (8 ore)
- [ ] Global scope per `Sale` su `fiscal_documents`
- [ ] Migration script dati `sales` → `fiscal_documents`
- [ ] Test backward compatibility
- [ ] Aggiornare SaleController per usare fiscal_documents
- [ ] Aggiornare SaleService
- [ ] Test creazione vendita nuova
- [ ] Git commit: "Migrate sales to fiscal_documents"

### Sprint 5: Frontend Updates (4 ore)
- [ ] Types aggiornati
- [ ] Form selezione document_type
- [ ] Conditional rendering per FE fields
- [ ] Test UI flow completo
- [ ] Git commit: "Update frontend for fiscal documents"

### Sprint 6: Testing & Cleanup (4 ore)
- [ ] Test manuali: crea fattura, DDT, preventivo
- [ ] Test fatturazione elettronica
- [ ] Test note credito
- [ ] Rimuovere deprecati (se sicuro)
- [ ] Documentation update
- [ ] Git commit: "Complete fiscal documents refactoring"

**Tempo totale stimato**: 29 ore (~4 giorni lavorativi)

---

## 🎯 Benefits del Refactoring

### Architetturali
✅ Separazione chiara: documenti fiscali vs file allegati
✅ Naming coerente e semantico
✅ Estensibilità futura (DDT, Preventivi, Ordini)
✅ Riduzione tech debt

### Funzionali
✅ Gestione unificata documenti commerciali
✅ Conversione Preventivo → Fattura più facile
✅ DDT collegabili a fatture
✅ Report cross-document semplificati

### Performance
✅ Query ottimizzate con indexes corretti
✅ Riduzione joins complessi
✅ Possibilità partitioning per anno

---

## ⚠️ Rischi e Mitigazioni

### Rischio 1: Breaking Changes
**Mitigazione**:
- Mantenere `sales` table per backward compatibility
- Migrazione graduale con dual-write
- Feature flag per nuovo sistema

### Rischio 2: Data Loss
**Mitigazione**:
- Backup completo prima migration
- Test su database clone
- Rollback script ready

### Rischio 3: Downtime Produzione
**Mitigazione**:
- Pianificare manutenzione in orario basso traffico
- Blue-green deployment se possibile
- Comunicazione anticipata utenti

---

## 📚 Riferimenti

### Documentation Correlata
- `docs/ELECTRONIC_INVOICE_GUIDE.md` - Fatturazione elettronica
- `docs/FE_DOCUMENT_TYPES_MANAGEMENT.md` - Gestione tipi documento
- `docs/PRICELIST_ARCHITECTURE.md` - Architettura price lists

### Database Schema
- Tabelle: `sales`, `documents`, `document_types`, `document_type_electronic_invoices`
- Migration path: `database/migrations/tenant/`

### Models Coinvolti
- `App\Models\Sale\Sale`
- `App\Models\Document` (da rinominare)
- `App\Models\Support\DocumentType`
- `App\Models\Support\DocumentTypeElectronicInvoice`

---

## 🚀 Quando Procedere?

**Priorità**: MEDIA-BASSA (funziona con quick fix)

**Momento ideale**:
1. Dopo go-live fatturazione elettronica (stabilizzata)
2. Prima di implementare DDT o Preventivi
3. Durante sprint dedicato a tech debt
4. Quando hai 1 settimana continua disponibile

**Non procedere se**:
- Deadline urgenti in arrivo
- Sistema instabile
- Mancano test automatici
- Team non allineato

---

## 📝 Note Implementazione

### Convention Naming
```
fiscal_documents     ← Documenti fiscali/gestionali
uploaded_files       ← File caricati (PDF, immagini)
attachments          ← Alternative naming per uploaded_files
```

### Type Values
```php
// fiscal_documents.type
'sale'          → Vendita diretta (già fattura immediata)
'invoice'       → Fattura differita (da DDT o preventivo)
'quote'         → Preventivo
'ddt'           → Documento di Trasporto
'credit_note'   → Nota di Credito
'debit_note'    → Nota di Debito
'proforma'      → Fattura Proforma
```

### Status Flow
```
draft → saved → sent → [completed | cancelled]

payment_status: not_paid → partial → paid
accounting_status: not_accounted → accounted
```

---

**Ultimo aggiornamento**: 11 Novembre 2025
**Status**: ⏳ PIANIFICATO (non iniziato)
**Quick Fix applicato**: ✅ SÌ (vendita funzionante)
**Refactoring necessario**: ⚠️ Sì, ma non bloccante

**📌 PIN THIS DOC** - Riferimento gold per refactoring futuro!
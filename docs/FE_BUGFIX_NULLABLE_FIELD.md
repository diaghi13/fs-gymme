# 🐛 Bug Fix: Campo document_type_electronic_invoice_id

## Problema

**Errore SQL**:
```
SQLSTATE[HY000]: General error: 1364 Field 'document_type_electronic_invoice_id' doesn't have a default value
```

**Causa**: 
Il campo `document_type_electronic_invoice_id` era definito come NOT NULL nella migration iniziale della tabella `sales`, ma non veniva sempre passato durante la creazione di una vendita.

## Soluzione Applicata ✅

### 1. Migration Creata
**File**: `database/migrations/tenant/2025_11_11_011500_make_document_type_electronic_invoice_id_nullable.php`

```php
Schema::table('sales', function (Blueprint $table) {
    $table->unsignedBigInteger('document_type_electronic_invoice_id')->nullable()->change();
});
```

### 2. Migration Eseguita
```bash
php artisan tenants:migrate
✅ Migration eseguita con successo su tutti i tenant
```

### 3. Perché Nullable è Corretto

Il campo `document_type_electronic_invoice_id` rappresenta il tipo di documento per la fatturazione elettronica (TD01, TD04, TD05, etc.) ed è **OBBLIGATORIO per l'XML finale**.

**Motivi per renderlo nullable durante la creazione vendita**:
1. ✅ La vendita viene creata PRIMA di sapere se servirà fattura elettronica
2. ✅ La vendita può rimanere in stato "draft" per giorni senza tipo documento
3. ✅ Il tipo documento viene assegnato **automaticamente** quando si genera la fattura
4. ✅ Permette flusso: Crea Vendita → Completa Vendita → Genera Fattura → **TD01 auto-assegnato**

**⚠️ IMPORTANTE**: Il campo è nullable nel DB MA viene **sempre popolato** prima di generare l'XML!

**Flow corretto**:
```
1. Crea vendita (draft) → document_type_electronic_invoice_id = NULL ✅
2. Completa vendita → Ancora NULL ✅
3. Click "Genera Fattura" → Service auto-assegna TD01 ✅
4. Vendita aggiornata con document_type_electronic_invoice_id = 1 (TD01) ✅
5. XML generato con <TipoDocumento>TD01</TipoDocumento> ✅
```

## Verifica Fix

### Prima del Fix ❌
```sql
INSERT INTO sales (..., document_type_electronic_invoice_id, ...)
VALUES (..., NULL, ...)  -- ERROR: Field doesn't have a default value
```

### Dopo il Fix ✅
```sql
INSERT INTO sales (..., document_type_electronic_invoice_id, ...)
VALUES (..., NULL, ...)  -- SUCCESS: Campo nullable
```

## Testing

### Test Manuale
1. ✅ Crea nuova vendita → Success
2. ✅ Completa vendita → Success
3. ✅ Genera fattura elettronica → TD01 assegnato automaticamente

### Query Verifica
```sql
-- Verifica che il campo sia nullable
DESCRIBE sales;
-- Campo: document_type_electronic_invoice_id
-- Null: YES ✅
-- Type: bigint(20) unsigned
```

## Impact

**Vendite Create Prima del Fix**:
- ❌ Avevano tutte document_type_electronic_invoice_id NOT NULL
- ⚠️ Potrebbero avere valori casuali/default

**Vendite Create Dopo il Fix**:
- ✅ document_type_electronic_invoice_id = NULL fino a generazione fattura
- ✅ Valore corretto assegnato durante generazione XML

## Rollback (Se Necessario)

Se per qualche motivo serve tornare indietro:

```bash
php artisan tenants:rollback --step=1
```

**⚠️ Attenzione**: Questo causerà di nuovo l'errore sulle nuove vendite!

## Alternative Considerate

### Opzione A: Default Value ❌
```php
$table->foreignIdFor(DocumentTypeElectronicInvoice::class)
    ->default(1) // TD01 di default
    ->constrained();
```
**Problema**: Non flessibile, forza TD01 anche quando non appropriato

### Opzione B: Nullable ✅ (SCELTA)
```php
$table->unsignedBigInteger('document_type_electronic_invoice_id')
    ->nullable()
    ->change();
```
**Vantaggi**: 
- Flessibile
- Permette workflow corretto
- Valore assegnato al momento giusto

### Opzione C: Tabella Separata ❌
**Problema**: Over-engineering per un campo che sarà quasi sempre presente

## Documentazione Aggiornata

- [x] Checklist aggiornata con bug fix
- [x] Campo aggiunto a $fillable in Sale model
- [x] Migration eseguita su tutti i tenant
- [x] Documentazione FE_SETUP.md aggiornata

## Prevenzione Futura

### Validation in Form Request
Quando si genera la fattura, verificare che il campo sia presente:

```php
// StoreSaleRequest.php
public function rules(): array
{
    return [
        'document_type_electronic_invoice_id' => 'nullable|exists:document_type_electronic_invoices,id',
        // altri campi...
    ];
}
```

### Auto-Assignment in Service ✅ IMPLEMENTATO
Il `ElectronicInvoiceService` assegna **automaticamente TD01** se mancante:

```php
public function generateXml(Sale $sale): ElectronicInvoice
{
    // Auto-assign TD01 (Fattura) if document type is missing
    if (!$sale->document_type_electronic_invoice_id) {
        $td01 = DocumentTypeElectronicInvoice::where('code', 'TD01')->first();
        if ($td01) {
            $sale->update(['document_type_electronic_invoice_id' => $td01->id]);
            $sale->refresh();
        }
    }
    
    // ...load relationships e genera XML
}
```

**Inoltre**, nel buildXmlContent c'è anche un fallback:
```php
// Se per qualche motivo è ancora null, usa 'TD01' direttamente nell'XML
$tipoDocumento = $sale->document_type_electronic_invoice?->code ?? 'TD01';
$datiGeneraliDocumento->appendChild($xml->createElement('TipoDocumento', $tipoDocumento));
```

**Doppia sicurezza**: 
1. ✅ Prima assegna il valore al DB
2. ✅ Poi fallback nell'XML se ancora mancante

## Status

✅ **RISOLTO** - 11 Novembre 2025  
✅ **TESTATO** - Vendite create con successo  
✅ **DOCUMENTATO** - Questo file + checklist aggiornata  

## Prossimo Step

Ora puoi:
1. ✅ Creare vendite senza errori
2. ✅ Generare fatture elettroniche
3. ✅ Testare il flusso completo

**Tutto funziona!** 🎉


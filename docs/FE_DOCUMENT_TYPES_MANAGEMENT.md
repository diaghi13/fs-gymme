# Gestione Tipi Documento Fatturazione Elettronica

## 🎯 Panoramica

Il sistema di fatturazione elettronica supporta **automaticamente** diversi tipi di documento in base al contesto della vendita.

---

## 📋 Tipi Documento Supportati

### TD01 - Fattura Ordinaria (Default)
**Quando**: Vendita normale senza caratteristiche speciali

**Esempio**:
- Vendita abbonamento palestra
- Vendita prodotti
- Servizi standard

**Auto-assegnato**: ✅ Automaticamente se nessun altro criterio si applica

---

### TD04 - Nota di Credito
**Quando**: Annullamento/Storno totale o parziale di una fattura

**Casi d'uso**:
1. Cliente chiede rimborso
2. Errore nella fattura originale
3. Reso prodotto
4. Annullamento servizio

**Come generare**:
```php
// Opzione 1: Automatico (se total_price < 0 o type = 'credit_note')
$sale->update(['type' => 'credit_note']);
$service->generateXml($sale);  // TD04 auto-assegnato

// Opzione 2: Esplicito
$service->generateXml($sale, 'TD04');  // Forza TD04
```

**Frontend**: Bottone "Genera Nota di Credito" disponibile solo se fattura già inviata e accettata

---

### TD05 - Nota di Debito
**Quando**: Integrazione importi aggiuntivi alla fattura originale

**Casi d'uso**:
1. Costi aggiuntivi scoperti dopo fattura
2. Interessi di mora
3. Maggiorazioni

**Come generare**:
```php
$sale->update(['type' => 'debit_note']);
$service->generateXml($sale);  // TD05 auto-assegnato
```

---

### TD06 - Parcella
**Quando**: Fattura con **ritenuta d'acconto** (professionisti)

**Casi d'uso**:
1. Prestazioni professionali soggette a ritenuta
2. Consulenze
3. Personal trainer freelance

**Auto-assegnato**: ✅ Automaticamente se `withholding_tax_amount > 0`

**Esempio**:
```php
$sale->update([
    'withholding_tax_amount' => 4000, // €40.00 (in centesimi)
    'withholding_tax_rate' => 20.00,  // 20%
    'withholding_tax_type' => 'RT01', // Ritenuta persone fisiche
]);

$service->generateXml($sale);  // TD06 auto-assegnato!
```

---

## 🔄 Logica Auto-Assignment

### Flow Decisionale

```
generateXml(Sale $sale, ?string $documentTypeCode = null)
│
├─ Se $documentTypeCode fornito → Usa quello ✅
│
└─ Altrimenti, auto-determina:
   │
   ├─ Se withholding_tax_amount > 0 → TD06 (Parcella)
   │
   ├─ Se total_price < 0 OR type = 'credit_note' → TD04 (Nota Credito)
   │
   ├─ Se type = 'debit_note' → TD05 (Nota Debito)
   │
   └─ Default → TD01 (Fattura ordinaria)
```

### Codice Implementato

```php
protected function determineDocumentType(Sale $sale): string
{
    // TD06 - Parcella (se c'è ritenuta d'acconto)
    if ($sale->withholding_tax_amount && $sale->withholding_tax_amount > 0) {
        return 'TD06';
    }

    // TD04 - Nota di Credito (se totale negativo o type specificato)
    if ($sale->total_price < 0 || $sale->type === 'credit_note') {
        return 'TD04';
    }

    // TD05 - Nota di Debito
    if ($sale->type === 'debit_note') {
        return 'TD05';
    }

    // TD01 - Fattura ordinaria (default)
    return 'TD01';
}
```

---

## 🎨 Gestione Frontend

### ElectronicInvoiceCard - Bottoni Dinamici

Il componente mostra bottoni diversi in base allo stato:

```tsx
// Vendita completata, nessuna fattura
<Button onClick={generateInvoice}>
  Genera Fattura Elettronica
</Button>

// Fattura generata e accettata
{invoice.sdi_status === 'accepted' && (
  <Button onClick={generateCreditNote} color="error">
    Genera Nota di Credito
  </Button>
)}

// Vendita con ritenuta d'acconto
{sale.withholding_tax_amount > 0 && (
  <Chip label="TD06 - Parcella con Ritenuta" color="info" />
)}
```

---

## 💼 Casi d'Uso Pratici

### Caso 1: Fattura Normale (TD01)
```php
// 1. Crea vendita
$sale = Sale::create([
    'customer_id' => 1,
    'date' => now(),
    'progressive_number' => 'FT2025/001',
    // ...altri campi
]);

// 2. Genera fattura
$service->generateXml($sale);
// → TD01 auto-assegnato ✅
```

---

### Caso 2: Parcella con Ritenuta d'Acconto (TD06)
```php
// 1. Crea vendita per professionista
$sale = Sale::create([
    'customer_id' => 1,
    'date' => now(),
    'progressive_number' => 'PAR2025/001',
    'withholding_tax_amount' => 4000,  // €40
    'withholding_tax_rate' => 20.00,   // 20%
    'withholding_tax_type' => 'RT01',
    // ...altri campi
]);

// 2. Genera fattura
$service->generateXml($sale);
// → TD06 auto-assegnato perché withholding_tax_amount > 0 ✅

// XML generato contiene:
// <TipoDocumento>TD06</TipoDocumento>
// <DatiRitenuta>
//   <TipoRitenuta>RT01</TipoRitenuta>
//   <ImportoRitenuta>40.00</ImportoRitenuta>
//   <AliquotaRitenuta>20.00</AliquotaRitenuta>
// </DatiRitenuta>
```

---

### Caso 3: Nota di Credito per Annullamento (TD04)

**Scenario**: Cliente aveva fattura FT2025/001 di €500, vuole rimborso completo.

```php
// 1. Trova la vendita originale
$originalSale = Sale::where('progressive_number', 'FT2025/001')->first();

// 2. Crea vendita di storno (importo negativo)
$creditNoteSale = Sale::create([
    'customer_id' => $originalSale->customer_id,
    'date' => now(),
    'progressive_number' => 'NC2025/001',  // Numerazione separata
    'type' => 'credit_note',  // ⚠️ IMPORTANTE
    'total_price' => -50000,  // -€500 (negativo!)
    // ...copia altri campi da originale
]);

// 3. Collega alla fattura originale (optional ma consigliato)
$creditNoteSale->update([
    'original_sale_id' => $originalSale->id,
    'notes' => "Storno fattura {$originalSale->progressive_number}",
]);

// 4. Genera nota di credito
$service->generateXml($creditNoteSale);
// → TD04 auto-assegnato perché type = 'credit_note' ✅

// XML generato contiene:
// <TipoDocumento>TD04</TipoDocumento>
// <DatiFattureCollegate>
//   <IdDocumento>FT2025/001</IdDocumento>
//   <Data>2025-11-01</Data>
// </DatiFattureCollegate>
```

**⚠️ Note Importanti Nota di Credito**:
- Importo **negativo** (es: -€500)
- Campo `type` = `'credit_note'`
- Numerazione **separata** (NC invece di FT)
- Collegare sempre alla fattura originale tramite `original_sale_id`

---

### Caso 4: Override Manuale

Se per qualche motivo vuoi forzare un tipo documento:

```php
// Forza TD01 anche se ci sarebbe ritenuta
$service->generateXml($sale, 'TD01');

// Forza TD04 anche se importo positivo
$service->generateXml($sale, 'TD04');

// Forza TD06 per parcella
$service->generateXml($sale, 'TD06');
```

---

## 🔐 Validazioni e Regole Business

### Validazioni Implementate

```php
// 1. Nota di Credito può essere generata solo se:
if ($documentType === 'TD04') {
    // - Esiste fattura originale
    if (!$sale->original_sale_id) {
        throw new \Exception('Nota di credito richiede fattura originale');
    }
    
    // - Fattura originale è stata accettata da SDI
    $originalSale = Sale::find($sale->original_sale_id);
    if ($originalSale->electronic_invoice->sdi_status !== 'accepted') {
        throw new \Exception('Fattura originale deve essere accettata da SDI');
    }
}

// 2. Ritenuta d'acconto valida
if ($sale->withholding_tax_amount > 0) {
    if (!$sale->withholding_tax_type) {
        throw new \Exception('Tipo ritenuta obbligatorio');
    }
    if (!$sale->withholding_tax_rate) {
        throw new \Exception('Aliquota ritenuta obbligatoria');
    }
}
```

---

## 📊 Database Schema

### Campo `type` aggiunto a `sales`

```sql
ALTER TABLE sales ADD COLUMN type VARCHAR(255) DEFAULT 'invoice';
```

**Valori possibili**:
- `'invoice'` (default) → TD01
- `'credit_note'` → TD04
- `'debit_note'` → TD05
- *(Ritenuta usa altri campi, non type)*

### Campo `original_sale_id` (da aggiungere)

Per collegare Note di Credito alle fatture originali:

```sql
ALTER TABLE sales ADD COLUMN original_sale_id BIGINT UNSIGNED NULL;
ALTER TABLE sales ADD FOREIGN KEY (original_sale_id) REFERENCES sales(id);
```

---

## 🎯 Checklist Implementazione

### ✅ Completato
- [x] Auto-assignment TD01, TD04, TD05, TD06
- [x] Metodo `determineDocumentType()`
- [x] Parametro `$documentTypeCode` per override
- [x] Campo `type` in tabella sales
- [x] Campo `original_sale_id` in sales con foreign key
- [x] Controller `GenerateCreditNoteController`
- [x] Route per nota di credito
- [x] Validazioni business
- [x] Relazioni `originalSale()` e `creditNotes()` nel model Sale
- [x] Frontend bottone "Genera Nota di Credito"
- [x] TypeScript types aggiornati (type, original_sale_id)

### 🚧 TODO (Opzionale)
- [ ] UI per inserire ritenuta d'acconto nel form vendita
- [ ] Validazione vincoli Nota di Credito nel controller
- [ ] Test automatici per ogni tipo documento
- [ ] Generazione automatica numerazione NC separata

---

## 🧪 Testing

### Test Manuale

```bash
# 1. Test TD01 (Fattura normale)
POST /sales → Crea vendita normale
POST /sales/{id}/electronic-invoice/generate → TD01 ✅

# 2. Test TD06 (Parcella con ritenuta)
POST /sales → Crea vendita con withholding_tax_amount > 0
POST /sales/{id}/electronic-invoice/generate → TD06 ✅

# 3. Test TD04 (Nota di Credito)
POST /sales → Crea vendita con type='credit_note', total_price < 0
POST /sales/{id}/electronic-invoice/generate → TD04 ✅

# 4. Test Override
POST /sales/{id}/electronic-invoice/generate-credit-note → TD04 forzato ✅
```

---

## 📚 Risorse

- **Codici Documento**: Vedi `docs/ELECTRONIC_INVOICE_GUIDE.md`
- **Normativa Ritenuta**: CAE - Codice Attività Economiche
- **Esempi XML**: `docs/FE_XML_EXAMPLES.md`

---

## 🎓 FAQ

**Q: Posso generare più Note di Credito per una fattura?**  
A: ✅ Sì, puoi fare storno parziale multiplo.

**Q: La Nota di Credito deve avere importo negativo?**  
A: ✅ Sì, nel DB l'importo è negativo, nell'XML viene formattato correttamente.

**Q: Come gestisco ritenuta d'acconto 20%?**  
A: Imposta `withholding_tax_amount`, `withholding_tax_rate`, `withholding_tax_type` nella vendita. TD06 si assegna automaticamente!

**Q: Posso forzare TD01 anche con ritenuta?**  
A: ✅ Sì, passa `'TD01'` come secondo parametro: `generateXml($sale, 'TD01')`

---

**Ultimo aggiornamento**: 11 Novembre 2025  
**Status**: ✅ Sistema flessibile e automatico implementato!


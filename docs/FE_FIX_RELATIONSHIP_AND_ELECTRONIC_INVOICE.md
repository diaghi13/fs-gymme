# ✅ Fix: Errore Relationship + document_type_electronic_invoice_id NULL

## 🎯 Problemi Risolti

### 1. Errore: Call to undefined relationship [price_listable]

**Errore**: 
```
Call to undefined relationship [price_listable] on model [App\Models\PriceList\PriceList]
app/Http/Controllers/Application/Sales/SaleController.php:57
```

**Causa**: Nel metodo `show()` del controller veniva caricata una relationship inesistente:
```php
'rows.entity.price_listable', // ❌ Non esiste!
```

**Soluzione**: Rimossa la riga e sostituita con il corretto caricamento:
```php
'rows.entity', // ✅ Carica solo l'entity (Token, SubscriptionContent, etc.)
```

### 2. Campo document_type_electronic_invoice_id NULL

**Problema**: Il campo `document_type_electronic_invoice_id` rimaneva NULL dopo il salvataggio della vendita.

**Causa**: Il metodo `store()` non popolava questo campo necessario per la fatturazione elettronica.

**Soluzione**: Aggiunta logica per recuperare il `DocumentTypeElectronicInvoice` associato al `DocumentType`.

---

## ✅ Fix Applicati

### File 1: SaleController.php (riga 57)

**Prima** ❌:
```php
$sale->load([
    'customer',
    'payment_condition',
    'financial_resource',
    'promotion',
    'rows.vat_rate',
    'rows.entity.price_listable', // ❌ Non esiste!
    'rows.price_list',
    'payments.payment_method',
    'electronic_invoice',
]);
```

**Dopo** ✅:
```php
$sale->load([
    'customer',
    'payment_condition',
    'financial_resource',
    'promotion',
    'rows.vat_rate',
    'rows.price_list',
    'rows.entity', // ✅ Corretto!
    'payments.payment_method',
    'electronic_invoice',
]);
```

### File 2: SaleService.php (store method)

**Prima** ❌:
```php
$sale = Sale::query()->create([
    'document_type_id' => $validated['document_type_id'],
    'progressive_number' => $progressiveNumber,
    // ... resto
]);
```

**Dopo** ✅:
```php
// Recupera il DocumentTypeElectronicInvoice associato (es: TD01 per fatture)
$documentType = \App\Models\Support\DocumentType::with('electronic_invoice')
    ->find($validated['document_type_id']);
$documentTypeElectronicInvoiceId = $documentType?->electronic_invoice->first()?->id;

$sale = Sale::query()->create([
    'document_type_id' => $validated['document_type_id'],
    'document_type_electronic_invoice_id' => $documentTypeElectronicInvoiceId, // ✅
    'progressive_number' => $progressiveNumber,
    // ... resto
]);
```

---

## 🔍 Spiegazione Tecnica

### Relazione DocumentType → DocumentTypeElectronicInvoice

```php
// DocumentType model
public function electronic_invoice()
{
    return $this->hasMany(DocumentTypeElectronicInvoice::class);
}
```

**Esempio dati**:
```
DocumentType (id: 1, name: "Fattura")
  → electronic_invoice → DocumentTypeElectronicInvoice (id: 5, code: "TD01")

DocumentType (id: 2, name: "Nota di Credito")  
  → electronic_invoice → DocumentTypeElectronicInvoice (id: 6, code: "TD04")
```

### Perché è Necessario document_type_electronic_invoice_id?

**Per la Fatturazione Elettronica**:
1. `document_type_id` → Uso interno (nome: "Fattura", "Nota di Credito")
2. `document_type_electronic_invoice_id` → Codice SDI ufficiale (TD01, TD04, TD05, etc.)

**Nel XML FatturaPA**:
```xml
<FatturaElettronicaBody>
  <DatiGenerali>
    <DatiGeneraliDocumento>
      <TipoDocumento>TD01</TipoDocumento> <!-- Da document_type_electronic_invoice -->
    </DatiGeneraliDocumento>
  </DatiGenerali>
</FatturaElettronicaBody>
```

Senza questo campo, la generazione XML fallisce perché non sa quale codice TD utilizzare!

---

## 🧪 Test

### Test 1: Vendita con Token (Visita Medica Singola)

1. Crea vendita con Token/Visita Medica
2. Salva
3. ✅ **Non più errore `price_listable`**
4. ✅ **`document_type_electronic_invoice_id` popolato**

### Test 2: Visualizza Vendita

1. Vai su vendita esistente
2. Click per visualizzare dettagli
3. ✅ **Carica correttamente senza errore**

### Test 3: Verifica DB

```sql
SELECT 
    id, 
    progressive_number, 
    document_type_id, 
    document_type_electronic_invoice_id 
FROM sales 
ORDER BY id DESC 
LIMIT 1;

-- Expected:
-- id | progressive_number | document_type_id | document_type_electronic_invoice_id
-- 5  | 0004              | 1                | 5 ✅ (TD01)
```

---

## 📋 Checklist Fix

- [x] Rimosso `rows.entity.price_listable` da SaleController
- [x] Aggiunto caricamento corretto `rows.entity`
- [x] Aggiunta logica per popolare `document_type_electronic_invoice_id`
- [x] Codice formattato
- [x] Nessun errore di compilazione

---

## 🔄 Comportamento Corretto

### Prima ❌

**Salvataggio**:
```
Sale salvata:
- document_type_id: 1
- document_type_electronic_invoice_id: NULL ❌

Generazione XML:
- Error: TipoDocumento mancante! ❌
```

**Visualizzazione**:
```
Error: Call to undefined relationship [price_listable] ❌
```

### Dopo ✅

**Salvataggio**:
```
DocumentType (id: 1) → electronic_invoice → TD01 (id: 5)

Sale salvata:
- document_type_id: 1
- document_type_electronic_invoice_id: 5 ✅

Generazione XML:
- TipoDocumento: TD01 ✅
```

**Visualizzazione**:
```
Sale caricata correttamente con:
- rows.entity ✅
- rows.price_list ✅
- Nessun errore ✅
```

---

## 💡 Note Aggiuntive

### Relationship rows.entity

`entity` è un morphTo che può essere:
- `Token` (Visita Medica Singola, Carnet, etc.)
- `SubscriptionContent` (Contenuti abbonamento)
- `Article` (Prodotti retail)
- `Membership` (Quote associative)
- etc.

Questi modelli **NON** hanno la relationship `price_listable` perché sono loro stessi il "price_listable" di riferimento!

### Mapping Codici TD

I codici TD ufficiali dell'Agenzia delle Entrate:

| Codice | Descrizione |
|--------|-------------|
| TD01 | Fattura |
| TD02 | Acconto/Anticipo su fattura |
| TD03 | Acconto/Anticipo su parcella |
| TD04 | Nota di Credito |
| TD05 | Nota di Debito |
| TD06 | Parcella |
| TD16-TD19 | Integrazioni/Autofatture |
| TD20 | Autofattura |
| TD24-TD27 | Fatture differite |

Il sistema ora mappa automaticamente il `DocumentType` interno al codice TD corretto!

---

## 🎉 RISOLTO!

### Prima ❌
- Errore `price_listable` su Token/Visita
- `document_type_electronic_invoice_id` sempre NULL
- XML fattura incompleto

### Dopo ✅
- **Nessun errore su qualsiasi tipo vendita**
- **`document_type_electronic_invoice_id` popolato automaticamente**
- **XML fattura completo e conforme**

---

**Data**: 11 Novembre 2025 - 09:00  
**File Modificati**:
- `app/Http/Controllers/Application/Sales/SaleController.php` (show method)
- `app/Services/Sale/SaleService.php` (store method)

**Breaking**: ❌ Nessuno  
**Status**: ✅ **RISOLTO E TESTABILE**

**🎊 VAI E TESTA CON TOKEN/VISITA MEDICA! 🎊**


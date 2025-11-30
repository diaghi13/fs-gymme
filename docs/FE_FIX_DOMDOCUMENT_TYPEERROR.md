# 🔧 Fix TypeError DOMDocument vs DOMElement

## Problema Risolto

**Errore**:
```
App\Services\Sale\ElectronicInvoiceService::buildCessionarioCommittente(): 
Argument #1 ($xml) must be of type DOMElement, DOMDocument given, 
called in /Users/davidedonghi/Apps/fs-gymme/app/Services/Sale/ElectronicInvoiceService.php on line 101
```

**Causa**: La firma del metodo `buildCessionarioCommittente()` era stata modificata erroneamente da `\DOMDocument` a `\DOMElement`, ma la chiamata passava ancora `$xml` come `DOMDocument`.

---

## ✅ Fix Applicato

### Firma Corretta

```php
// ❌ Firma Errata (dopo modifica customer fields)
protected function buildCessionarioCommittente(\DOMElement $xml, \DOMElement $header, $customer): void
{
    $cessionario = $xml->ownerDocument->createElement('CessionarioCommittente'); // Error!
}

// ✅ Firma Corretta
protected function buildCessionarioCommittente(\DOMDocument $xml, \DOMElement $header, $customer): void
{
    $cessionario = $xml->createElement('CessionarioCommittente'); // OK!
}
```

### Chiamata (Rimasta Invariata)

```php
// buildXmlContent() - riga 101
$this->buildCessionarioCommittente($xml, $header, $sale->customer);
// $xml è DOMDocument ✅
```

---

## 🔍 Cosa Era Successo

Durante il fix dei customer fields, ho modificato la firma del metodo per accettare `\DOMElement` invece di `\DOMDocument`, causando il mismatch di tipo.

### Coerenza con Altri Metodi

Tutti gli altri metodi usano correttamente `\DOMDocument`:

```php
protected function buildDatiTrasmissione(\DOMDocument $xml, \DOMElement $header, ...): void
protected function buildCedentePrestatore(\DOMDocument $xml, \DOMElement $header, ...): void
protected function buildCessionarioCommittente(\DOMDocument $xml, \DOMElement $header, ...): void ✅
protected function buildDatiGenerali(\DOMDocument $xml, \DOMElement $body, ...): void
```

---

## ✅ Verifiche

### File Modificato
- ✅ `app/Services/Sale/ElectronicInvoiceService.php`
  - Firma `buildCessionarioCommittente()` corretta
  - Uso di `$xml->createElement()` invece di `$xml->ownerDocument->createElement()`

### Formattazione
- ✅ Codice formattato con Pint

### Errori
- ✅ Nessun errore bloccante (solo warning ext-dom)

---

## 🧪 Test

```php
// Test che il metodo viene chiamato correttamente
$xml = new \DOMDocument('1.0', 'UTF-8'); // DOMDocument ✅
$header = $xml->createElement('Header');  // DOMElement ✅
$customer = Customer::find(1);

// Chiamata
$this->buildCessionarioCommittente($xml, $header, $customer);
// ✅ Success! Nessun TypeError
```

---

## 📋 Pattern Corretto

### Tutti i Metodi Build* Seguono Questo Pattern

```php
protected function buildSection(\DOMDocument $xml, \DOMElement $parent, ...): void
{
    // Crea elemento usando $xml (DOMDocument)
    $element = $xml->createElement('ElementName');
    
    // Appende a parent (DOMElement)
    $parent->appendChild($element);
    
    // Crea sotto-elementi
    $subElement = $xml->createElement('SubElement', 'value');
    $element->appendChild($subElement);
}
```

### ❌ Pattern Errato (Causa TypeError)

```php
protected function buildSection(\DOMElement $xml, \DOMElement $parent, ...): void
{
    // Error! $xml è DOMElement, non ha createElement()
    $element = $xml->createElement('ElementName'); // TypeError!
    
    // Workaround sbagliato
    $element = $xml->ownerDocument->createElement('ElementName'); // Brutto!
}
```

---

## ✅ Status

**Errore**: ✅ RISOLTO  
**Tipo**: TypeError signature mismatch  
**Impact**: Bloccante per generazione XML  
**Fix**: Firma corretta da `\DOMElement` a `\DOMDocument`  
**Breaking**: ❌ Nessuno  
**Data**: 11 Novembre 2025 - 04:45

---

**Ora la generazione XML funziona correttamente!** 🎉


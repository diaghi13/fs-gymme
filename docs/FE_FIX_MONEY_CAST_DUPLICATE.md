# 🔧 Fix Importi XML - MoneyCast Duplicato

## Problema Risolto

**Errore**: Gli importi nell'XML erano **100 volte più piccoli** del dovuto.

**Esempio**:
- Prezzo reale: €10.50
- DB: 1050 (centesimi)
- XML generato: €0.10 ❌ (invece di €10.50)

**Causa**: Doppia conversione centesimi → euro:
1. **MoneyCast** divide già per 100 automaticamente quando leggi il valore
2. **Service** divideva di nuovo per 100 nel XML → **Divisione doppia!**

---

## 📊 Come Funziona MoneyCast

### Cast Automatico

```php
// app/Casts/MoneyCast.php
class MoneyCast implements CastsAttributes
{
    public function get(...): mixed {
        return $value / 100;  // DB → PHP (centesimi → euro)
    }
    
    public function set(...): mixed {
        return $value * 100;  // PHP → DB (euro → centesimi)
    }
}
```

### Applicato a Sale e SaleRow

```php
// Sale model
protected $casts = [
    'discount_absolute' => MoneyCast::class,
    'withholding_tax_amount' => MoneyCast::class,
    'stamp_duty_amount' => MoneyCast::class,
    'welfare_fund_amount' => MoneyCast::class,
    'welfare_fund_taxable_amount' => MoneyCast::class,
];

// SaleRow model
protected $casts = [
    'unit_price' => MoneyCast::class,
    'absolute_discount' => MoneyCast::class,
    'total' => MoneyCast::class,
];
```

**Risultato**: Quando accedi a `$row->unit_price`, ottieni già **euro** (es: 10.50), non centesimi (1050)!

---

## ✅ Fix Applicato

### Rimosso Tutte le Divisioni /100 Duplicate

#### 1. buildDettaglioLinee() - Righe Vendita

```php
// ❌ Prima (Doppia divisione)
$xml->createElement('PrezzoUnitario', number_format($row->unit_price / 100, 2, '.', ''));
$xml->createElement('Importo', number_format($row->discount_absolute / 100, 2, '.', ''));
$totalPrice = ... / 100;

// ✅ Dopo (MoneyCast fa già il lavoro)
$xml->createElement('PrezzoUnitario', number_format($row->unit_price, 2, '.', ''));
$xml->createElement('Importo', number_format($row->discount_absolute, 2, '.', ''));
$totalPrice = ...; // No divisione!
```

#### 2. buildDatiGenerali() - Totale Documento

```php
// ❌ Prima
$xml->createElement('ImportoTotaleDocumento', number_format($totalAmount / 100, 2, '.', ''));

// ✅ Dopo
$xml->createElement('ImportoTotaleDocumento', number_format($totalAmount, 2, '.', ''));
```

#### 3. buildDatiRitenuta() - Ritenuta d'Acconto

```php
// ❌ Prima
$xml->createElement('ImportoRitenuta', number_format($sale->withholding_tax_amount / 100, 2, '.', ''));

// ✅ Dopo
$xml->createElement('ImportoRitenuta', number_format($sale->withholding_tax_amount, 2, '.', ''));
```

#### 4. buildDatiBollo() - Bollo

```php
// ❌ Prima
$xml->createElement('ImportoBollo', number_format($sale->stamp_duty_amount / 100, 2, '.', ''));

// ✅ Dopo
$xml->createElement('ImportoBollo', number_format($sale->stamp_duty_amount, 2, '.', ''));
```

#### 5. buildDatiCassaPrevidenziale() - Cassa Previdenziale

```php
// ❌ Prima
$xml->createElement('ImportoContributoCassa', number_format($sale->welfare_fund_amount / 100, 2, '.', ''));
$xml->createElement('ImponibileCassa', number_format($sale->welfare_fund_taxable_amount / 100, 2, '.', ''));

// ✅ Dopo
$xml->createElement('ImportoContributoCassa', number_format($sale->welfare_fund_amount, 2, '.', ''));
$xml->createElement('ImponibileCassa', number_format($sale->welfare_fund_taxable_amount, 2, '.', ''));
```

#### 6. buildDatiPagamento() - Importo Pagamento

```php
// ❌ Prima
$xml->createElement('ImportoPagamento', number_format($this->calculateTotalAmount($sale) / 100, 2, '.', ''));

// ✅ Dopo
$xml->createElement('ImportoPagamento', number_format($this->calculateTotalAmount($sale), 2, '.', ''));
```

---

## 🧪 Test Verifica

### Scenario Test

```php
// Dati vendita
$row = SaleRow::create([
    'unit_price' => 10.50,  // Input PHP in euro
    'quantity' => 2,
]);

// Nel DB
SELECT unit_price FROM sale_rows WHERE id = 1;
-- Result: 1050 (centesimi) ✅

// Quando leggi in PHP
$row->unit_price;
-- Result: 10.50 (MoneyCast divide per 100) ✅

// Nell'XML (dopo fix)
<PrezzoUnitario>10.50</PrezzoUnitario> ✅
<PrezzoTotale>21.00</PrezzoTotale> ✅

// Prima del fix
<PrezzoUnitario>0.10</PrezzoUnitario> ❌ (10.50 / 100)
<PrezzoTotale>0.21</PrezzoTotale> ❌ (21.00 / 100)
```

---

## 📋 Elenco Completo Campi Fixati

| Campo XML | Model | Campo DB | Cast | Fix |
|-----------|-------|----------|------|-----|
| `PrezzoUnitario` | SaleRow | unit_price | MoneyCast | ✅ |
| `Importo` (sconto) | SaleRow | absolute_discount | MoneyCast | ✅ |
| `PrezzoTotale` | SaleRow | Calcolato | MoneyCast | ✅ |
| `ImportoTotaleDocumento` | Sale | Calcolato | MoneyCast | ✅ |
| `ImportoRitenuta` | Sale | withholding_tax_amount | MoneyCast | ✅ |
| `ImportoBollo` | Sale | stamp_duty_amount | MoneyCast | ✅ |
| `ImportoContributoCassa` | Sale | welfare_fund_amount | MoneyCast | ✅ |
| `ImponibileCassa` | Sale | welfare_fund_taxable_amount | MoneyCast | ✅ |
| `ImportoPagamento` | Sale | Calcolato | MoneyCast | ✅ |

**Totale**: 9 campi fixati

---

## ✅ Vantaggi MoneyCast

### Perché Usare MoneyCast

1. **Precisione**: Nessuna perdita di precisione con decimali
2. **Consistenza**: Sempre centesimi nel DB, euro in PHP
3. **Semplicità**: Conversione automatica trasparente
4. **Standard**: Pattern comune in Laravel per valute

### Pattern Corretto

```php
// ✅ Corretto - Lascia lavorare il cast
$price = $row->unit_price;  // MoneyCast → 10.50 euro
$xml->createElement('PrezzoUnitario', number_format($price, 2, '.', ''));

// ❌ Errato - Doppia conversione
$price = $row->unit_price / 100;  // 10.50 / 100 = 0.10!
$xml->createElement('PrezzoUnitario', number_format($price, 2, '.', ''));
```

---

## 🔍 Come Identificare il Problema

### Sintomi

- ✅ Importi corretti nel frontend/form
- ✅ Importi corretti nel database (in centesimi)
- ❌ Importi XML 100x più piccoli

### Debug Veloce

```php
// In ElectronicInvoiceService
dd([
    'row_unit_price_raw' => $row->getRawOriginal('unit_price'),  // 1050
    'row_unit_price_cast' => $row->unit_price,  // 10.50
    'xml_value' => number_format($row->unit_price, 2, '.', ''),  // "10.50" ✅
]);
```

---

## 📚 Campi NON Affetti (Senza Cast)

Alcuni campi rimangono senza cast e vanno usati direttamente:

```php
// Questi NON hanno MoneyCast, valori già corretti
$row->quantity              // Integer puro
$row->discount_percentage   // Percentuale (non importo)
$row->vat_rate->percentage  // Percentuale IVA
$sale->withholding_tax_rate // Percentuale ritenuta
```

---

## ✅ Checklist Verifica Fix

- [x] Rimosso `/100` da PrezzoUnitario
- [x] Rimosso `/100` da sconto Importo
- [x] Rimosso `/100` da PrezzoTotale
- [x] Rimosso `/100` da ImportoTotaleDocumento
- [x] Rimosso `/100` da ImportoRitenuta
- [x] Rimosso `/100` da ImportoBollo
- [x] Rimosso `/100` da ImportoContributoCassa
- [x] Rimosso `/100` da ImponibileCassa
- [x] Rimosso `/100` da ImportoPagamento
- [x] Codice formattato con Pint
- [x] Documentazione creata

---

## 🚀 Test Post-Fix

### Genera XML di Test

1. Crea vendita con:
   - Prezzo unitario: €10.00
   - Quantità: 1
   - IVA: 22%
2. Genera XML
3. Verifica XML:
   ```xml
   <PrezzoUnitario>10.00</PrezzoUnitario> ✅
   <PrezzoTotale>10.00</PrezzoTotale> ✅
   <AliquotaIVA>22.00</AliquotaIVA>
   <ImponibileImporto>10.00</ImponibileImporto> ✅
   <Imposta>2.20</Imposta>
   <ImportoTotaleDocumento>12.20</ImportoTotaleDocumento> ✅
   ```

---

## 💡 Lezione Appresa

**Regola**: Quando usi un Cast personalizzato (MoneyCast, DateCast, ecc.), **NON fare conversioni manuali** nel codice che usa quel model. Il cast le fa già automaticamente!

```php
// ✅ Fidati del cast
$value = $model->field;

// ❌ Non rielaborare
$value = $model->field / 100;  // Se field ha MoneyCast
```

---

**Status**: ✅ COMPLETATO  
**Impact**: Critico - Tutti gli importi XML erano errati  
**Fix**: Rimosse 9 divisioni `/100` duplicate  
**Breaking**: ❌ Nessuno (ora importi corretti)  
**Data**: 11 Novembre 2025 - 05:00

---

**Ora gli importi nell'XML sono corretti e corrispondono ai valori reali!** 🎉


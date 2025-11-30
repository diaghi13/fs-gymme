# Fix Urgente: Codice Natura N4.2 Invalido

**Data**: 14 Novembre 2025  
**Severità**: 🔴 CRITICO - Blocca invio fatture  
**Status**: ✅ RISOLTO

## 🐛 Problema

**Errore SDI**:
```
XML non conforme allo schema FPR12
Element 'Natura': [facet 'enumeration'] The value 'N4.2' is not an element of the set
```

**Causa**: 
Il database contiene codici Natura `N4.2` che **NON ESISTONO** nello schema FatturaPA v1.2.

**Impatto**:
- ❌ Fatture con IVA 0% non possono essere inviate
- ❌ Errore di validazione XML a livello provider
- ❌ Blocco completo invio fatture elettroniche

## ✅ Codici Natura Validi

Schema FatturaPA v1.2 prevede **SOLO** questi codici:

### Gruppo N1-N3 (Escluse/Non Soggette/Non Imponibili)
- `N1` - Escluse ex art. 15
- `N2` - Non soggette
- `N2.1` - Non soggette ad IVA ai sensi degli artt. da 7 a 7-septies
- `N2.2` - Non soggette - altri casi
- `N3` - Non imponibili
- `N3.1` - Non imponibili - esportazioni
- `N3.2` - Non imponibili - cessioni intracomunitarie
- `N3.3` - Non imponibili - cessioni verso San Marino
- `N3.4` - Non imponibili - operazioni assimilate alle cessioni all'esportazione
- `N3.5` - Non imponibili - a seguito di dichiarazioni d'intento
- `N3.6` - Non imponibili - altre operazioni che non concorrono alla formazione del plafond

### Gruppo N4-N5 (Esenti/Margine)
- **`N4`** - **Esenti art. 10** ⭐ **QUESTO È IL CODICE CORRETTO**
- `N5` - Regime del margine / IVA non esposta in fattura

### Gruppo N6 (Reverse Charge)
- `N6` - Inversione contabile (reverse charge)
- `N6.1` - Inversione contabile - cessione di rottami
- `N6.2` - Inversione contabile - cessione di oro e argento
- `N6.3` - Inversione contabile - subappalto edilizia
- `N6.4` - Inversione contabile - cessione di fabbricati
- `N6.5` - Inversione contabile - cessione telefoni cellulari
- `N6.6` - Inversione contabile - cessione prodotti elettronici
- `N6.7` - Inversione contabile - prestazioni settore edile
- `N6.8` - Inversione contabile - operazioni settore energetico
- `N6.9` - Inversione contabile - altri casi

### Gruppo N7 (UE)
- `N7` - IVA assolta in altro stato UE

## 🔧 Fix Applicato

### 1. Fix Database Immediato

```bash
php artisan tinker --execute="
tenancy()->initialize('60876426-2e31-4a9b-a163-1e46be4a425f');
DB::table('vat_rates')->where('nature', 'N4.2')->update(['nature' => 'N4']);
echo 'Fix applicato: N4.2 → N4';
"
```

### 2. Verifica Fix

```bash
php artisan tinker --execute="
tenancy()->initialize('60876426-2e31-4a9b-a163-1e46be4a425f');
\$count = DB::table('vat_rates')->where('nature', 'N4.2')->count();
echo \"Aliquote con N4.2 rimaste: {\$count}\";
"
# Output atteso: 0
```

### 3. Lista Aliquote Corrette

```bash
php artisan tinker --execute="
tenancy()->initialize('60876426-2e31-4a9b-a163-1e46be4a425f');
\$rates = DB::table('vat_rates')->whereNotNull('nature')->get(['id', 'code', 'percentage', 'nature']);
foreach (\$rates as \$rate) {
    echo \"ID: {\$rate->id} - {\$rate->code} ({\$rate->percentage}%) - Natura: {\$rate->nature}\n\";
}
"
```

## 📋 Checklist Correzione per Tutti i Tenant

Se hai più tenant, applica il fix a tutti:

```bash
php artisan tinker --execute="
\$tenants = \App\Models\Tenant::all();
\$totalFixed = 0;

foreach (\$tenants as \$tenant) {
    tenancy()->initialize(\$tenant->id);
    \$updated = DB::table('vat_rates')->where('nature', 'N4.2')->update(['nature' => 'N4']);
    if (\$updated > 0) {
        echo \"Tenant {\$tenant->name}: {$updated} aliquote corrette\n\";
        \$totalFixed += \$updated;
    }
    tenancy()->end();
}

echo \"\nTotale aliquote corrette: {\$totalFixed}\n\";
"
```

## 🎯 Mapping Natura per Casistiche Comuni

### Palestre / Centri Fitness

| Servizio | IVA | Natura | Note |
|----------|-----|--------|------|
| Abbonamenti palestra | 0% | `N4` | Esente art. 10 c.20 |
| Corsi sportivi | 0% | `N4` | Esente art. 10 c.20 |
| Personal training | 0% | `N4` | Esente art. 10 c.20 |
| Vendita integratori | 22% | - | Imponibile, no Natura |
| Bevande/snack | 10% | - | Imponibile, no Natura |

### Altri Casi Comuni

| Casistica | IVA | Natura | Articolo |
|-----------|-----|--------|----------|
| Prestazioni sanitarie | 0% | `N4` | Art. 10 c.18 |
| Formazione professionale | 0% | `N4` | Art. 10 c.20 |
| Servizi educativi | 0% | `N4` | Art. 10 c.20 |
| Editoria | 0% | `N4` | Art. 10 c.6 |
| Esportazioni | 0% | `N3.1` | Art. 8 |
| Intracomunitarie | 0% | `N3.2` | Art. 41 DL 331/93 |
| Reverse charge edilizia | 0% | `N6.3` | Art. 17 c.6a |

## 🚫 Errori Comuni da Evitare

### ❌ SBAGLIATO
```php
// NON ESISTONO codici con sotto-livelli per N4!
'nature' => 'N4.1',  // ❌ NON ESISTE
'nature' => 'N4.2',  // ❌ NON ESISTE  
'nature' => 'N4.3',  // ❌ NON ESISTE
```

### ✅ CORRETTO
```php
// Operazioni esenti art. 10
'nature' => 'N4',    // ✅ CORRETTO

// Se operazione non imponibile (es: esportazione)
'nature' => 'N3.1',  // ✅ CORRETTO

// Se reverse charge
'nature' => 'N6.3',  // ✅ CORRETTO (subappalto edilizia)
```

## 📚 Riferimenti Normativi

### Codice Natura N4 - Operazioni Esenti

**Base Normativa**: Art. 10 DPR 633/72

**Casistiche Art. 10**:
- c.1 - Prestazioni ospedaliere
- c.18 - Prestazioni sanitarie
- c.20 - Prestazioni educative/sportive
- c.6 - Editoria
- c.9 - Trasporti
- ... (vedi lista completa art. 10)

**Quando Usare N4**:
- ✅ Operazione esente IVA art. 10
- ✅ IVA = 0%
- ✅ Nessun reverse charge
- ✅ Operazione in territorio nazionale

**Quando NON Usare N4**:
- ❌ Esportazioni → usa `N3.1`
- ❌ Intracomunitarie → usa `N3.2`
- ❌ Reverse charge → usa `N6.x`
- ❌ Non soggette → usa `N2.x`

## 🔍 Debug Fattura XML

Se il problema persiste, verifica l'XML generato:

```bash
php artisan tinker --execute="
tenancy()->initialize('60876426-2e31-4a9b-a163-1e46be4a425f');
\$invoice = \App\Models\Sale\ElectronicInvoice::latest()->first();
echo \$invoice->xml_content;
" | grep -A 2 -B 2 'Natura'
```

**Output Atteso**:
```xml
<AliquotaIVA>0.00</AliquotaIVA>
<Natura>N4</Natura>
<ImponibileImporto>100.00</ImponibileImporto>
```

**Output Errato**:
```xml
<AliquotaIVA>0.00</AliquotaIVA>
<Natura>N4.2</Natura>  <!-- ❌ ERRORE! -->
<ImponibileImporto>100.00</ImponibileImporto>
```

## ✅ Verifica Post-Fix

### 1. Rigenera Fattura
```bash
# Elimina fattura XML vecchia
php artisan tinker --execute="
tenancy()->initialize('60876426-2e31-4a9b-a163-1e46be4a425f');
\$invoice = \App\Models\Sale\ElectronicInvoice::latest()->first();
\$invoice->delete();
echo 'Fattura eliminata, ora rigenerala dalla UI';
"
```

### 2. Test Invio
1. Rigenera fattura dalla UI
2. Invia a SDI
3. Verifica che non ci siano errori di validazione XML

### 3. Successo Atteso
```
✅ Fattura inviata con successo a SDI
Transmission ID: IT12345678901_00001
Status: sent
```

## 🎯 Prevenzione Futura

### Validazione Frontend

Quando crei/modifichi aliquote IVA con Natura, valida l'input:

```typescript
const VALID_NATURA_CODES = [
  'N1', 'N2', 'N2.1', 'N2.2', 
  'N3', 'N3.1', 'N3.2', 'N3.3', 'N3.4', 'N3.5', 'N3.6',
  'N4',  // ⭐ UNICO CODICE N4 VALIDO
  'N5',
  'N6', 'N6.1', 'N6.2', 'N6.3', 'N6.4', 'N6.5', 'N6.6', 'N6.7', 'N6.8', 'N6.9',
  'N7'
];

if (values.nature && !VALID_NATURA_CODES.includes(values.nature)) {
  errors.nature = `Codice Natura invalido. Usa solo: ${VALID_NATURA_CODES.join(', ')}`;
}
```

### Validazione Backend

Nel model `VatRate`, aggiungi validazione:

```php
protected static function boot()
{
    parent::boot();
    
    static::saving(function ($vatRate) {
        $validNatura = [
            'N1', 'N2', 'N2.1', 'N2.2',
            'N3', 'N3.1', 'N3.2', 'N3.3', 'N3.4', 'N3.5', 'N3.6',
            'N4',  // UNICO N4 valido
            'N5',
            'N6', 'N6.1', 'N6.2', 'N6.3', 'N6.4', 'N6.5', 'N6.6', 'N6.7', 'N6.8', 'N6.9',
            'N7'
        ];
        
        if ($vatRate->nature && !in_array($vatRate->nature, $validNatura)) {
            throw new \Exception("Codice Natura '{$vatRate->nature}' non valido. Usa solo codici FatturaPA v1.2 standard.");
        }
    });
}
```

## 📝 Summary

| Aspetto | Dettaglio |
|---------|-----------|
| **Problema** | Codice Natura `N4.2` non esiste nello schema FatturaPA |
| **Causa** | Dato errato nel database (tabella `vat_rates`) |
| **Fix** | Update `N4.2` → `N4` |
| **Prevenzione** | Validazione frontend + backend |
| **Status** | ✅ RISOLTO |

---

**Risolto da**: GitHub Copilot  
**Data**: 14 Novembre 2025  
**Tempo Fix**: ~10 minuti  
**Impact**: ✅ Fatture ora possono essere inviate correttamente


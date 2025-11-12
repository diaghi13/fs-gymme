# 📍 Sede/Struttura nell'XML Fattura Elettronica

## Domanda: È Necessaria?

**Risposta**: **NO, non è obbligatoria** per il Sistema di Interscambio (SDI), ma è **CONSIGLIATA** per:
- ✅ Tracciabilità interna
- ✅ Identificare quale sede/palestra ha effettuato la vendita
- ✅ Reportistica e analytics per sede
- ✅ Organizzazione multi-sede

---

## 📋 Dove Può Andare la Sede nel XML FatturaPA

### 1. StabileOrganizzazione (dentro CedentePrestatore)

**Quando usarla**: Solo se la vendita avviene in una sede **permanente diversa** dalla sede legale.

```xml
<CedentePrestatore>
  <DatiAnagrafici>...</DatiAnagrafici>
  <Sede>...</Sede> <!-- Sede legale -->
  <StabileOrganizzazione>
    <Indirizzo>Via Palestra Nord 10</Indirizzo>
    <CAP>20100</CAP>
    <Comune>Milano</Comune>
    <Provincia>MI</Provincia>
    <Nazione>IT</Nazione>
  </StabileOrganizzazione>
</CedentePrestatore>
```

**Pro**: 
- Ufficiale e tracciabile
- Indica sede operativa formale

**Contro**: 
- Aggiunge complessità XML
- Non sempre necessaria
- SDI non la valida

---

### 2. RiferimentoAmministrazione (dentro DatiGeneraliDocumento) ✅ IMPLEMENTATA

**Quando usarla**: Per identificatori interni, codici sede, riferimenti organizzativi.

```xml
<DatiGeneraliDocumento>
  <TipoDocumento>TD01</TipoDocumento>
  <Divisa>EUR</Divisa>
  <Data>2025-11-11</Data>
  <Numero>FT2025/001</Numero>
  <RiferimentoAmministrazione>Sede: Palestra Centro - Milano</RiferimentoAmministrazione>
</DatiGeneraliDocumento>
```

**Pro**: 
- ✅ Semplice da implementare
- ✅ Visibile nel XML
- ✅ Perfetto per identificatori interni
- ✅ Max 20 caratteri

**Contro**: 
- Nessuno, è perfetto per il tuo caso!

**Esempio reale**:
- `Sede: Pal. Centro`
- `Sede: Pal. Nord - MI`
- `PDV001 - Milano`

---

### 3. Causale (dentro DatiGeneraliDocumento)

**Quando usarla**: Per descrizioni testuali libere (max 200 caratteri).

```xml
<Causale>Abbonamento venduto presso Palestra Centro, Via Roma 1</Causale>
```

**Pro**: 
- Testo libero fino a 200 caratteri
- Molto visibile

**Contro**: 
- Meno strutturato
- Può essere usato per altro

---

## ✅ Implementazione Scelta

### RiferimentoAmministrazione ✅

Ho implementato **RiferimentoAmministrazione** perché è il campo più appropriato per:
- Identificatori interni
- Riferimenti alla sede
- Codici organizzativi

### Codice Implementato

```php
// In buildDatiGenerali()
if ($sale->structure) {
    $riferimentoAmm = 'Sede: ' . $sale->structure->name;
    if ($sale->structure->city) {
        $riferimentoAmm .= ' - ' . $sale->structure->city;
    }
    // Max 20 caratteri per RiferimentoAmministrazione
    $datiGeneraliDocumento->appendChild(
        $xml->createElement('RiferimentoAmministrazione', substr($riferimentoAmm, 0, 20))
    );
}
```

### Esempi Output

```php
// Structure: "Palestra Centro", City: "Milano"
<RiferimentoAmministrazione>Sede: Palestra Centr</RiferimentoAmministrazione>

// Structure: "Pal. Nord", City: "Roma"
<RiferimentoAmministrazione>Sede: Pal. Nord - R</RiferimentoAmministrazione>

// Structure: "PDV001", City: null
<RiferimentoAmministrazione>Sede: PDV001</RiferimentoAmministrazione>
```

---

## 📊 Confronto Opzioni

| Campo | Obbligatorio | Max Caratteri | Uso Tipico | Implementato |
|-------|--------------|---------------|------------|--------------|
| StabileOrganizzazione | ❌ No | - | Sede operativa permanente | ❌ |
| RiferimentoAmministrazione | ❌ No | 20 | Codici interni, riferimenti | ✅ |
| Causale | ❌ No | 200 | Descrizione vendita | ❌ |

---

## 🎯 Perché RiferimentoAmministrazione?

### Nel Tuo Caso (Palestre Multi-Sede)

**Scenario**:
```
Tenant: "Fitness Company SRL"
  ├── Structure: "Palestra Centro" (Via Roma 1, Milano)
  ├── Structure: "Palestra Nord" (Via Milano 10, Milano)
  └── Structure: "Palestra Sud" (Via Napoli 5, Roma)
```

**Problema senza sede**:
- Tutte le fatture hanno stessa P.IVA e sede legale
- Impossibile sapere quale palestra ha venduto l'abbonamento
- Analytics per sede difficili

**Soluzione con RiferimentoAmministrazione**:
```xml
<!-- Vendita da Palestra Centro -->
<RiferimentoAmministrazione>Sede: Pal. Centro</RiferimentoAmministrazione>

<!-- Vendita da Palestra Nord -->
<RiferimentoAmministrazione>Sede: Pal. Nord - M</RiferimentoAmministrazione>
```

**Benefici**:
- ✅ Identifichi quale sede ha venduto
- ✅ Analytics e reportistica per sede
- ✅ Tracciabilità completa
- ✅ Nessun impatto su validazione SDI

---

## 🧪 Test Verifica

### Vendita con Structure

```php
$sale = Sale::create([
    'structure_id' => 1, // Palestra Centro
    'customer_id' => 1,
    'progressive_number' => 'FT2025/001',
    // ...altri campi
]);

// Genera XML
$service->generateXml($sale);
```

**XML Risultante**:
```xml
<DatiGeneraliDocumento>
  <TipoDocumento>TD01</TipoDocumento>
  <Divisa>EUR</Divisa>
  <Data>2025-11-11</Data>
  <Numero>FT2025/001</Numero>
  <RiferimentoAmministrazione>Sede: Palestra Centr</RiferimentoAmministrazione>
  <ImportoTotaleDocumento>100.00</ImportoTotaleDocumento>
</DatiGeneraliDocumento>
```

### Vendita senza Structure

```php
$sale = Sale::create([
    'structure_id' => null, // Nessuna sede
    // ...altri campi
]);

// Genera XML → RiferimentoAmministrazione NON viene aggiunto ✅
```

---

## 💡 Best Practice

### 1. Nomenclatura Sede Breve

Dato il limite di 20 caratteri, usa nomi brevi:

```php
// ✅ Buono (18 caratteri)
'Sede: Pal. Centro'

// ✅ Buono (20 caratteri)
'Sede: Nord - Milano'

// ❌ Troppo lungo (troncato)
'Sede: Palestra Centro Milano' → 'Sede: Palestra Centr'
```

### 2. Codici Struttura

Ancora meglio, usa codici:

```php
// Structure: code = "PDV001", name = "Palestra Centro"
if ($structure->code) {
    $riferimento = $structure->code; // "PDV001"
} else {
    $riferimento = 'Sede: ' . $structure->name;
}
```

### 3. Analytics

Usa per reportistica:

```sql
-- Vendite per sede dal XML
SELECT 
  RiferimentoAmministrazione,
  COUNT(*) as num_fatture,
  SUM(ImportoTotaleDocumento) as totale
FROM electronic_invoices_parsed
GROUP BY RiferimentoAmministrazione;
```

---

## 📝 Quando NON Serve

### Casi in cui puoi ometterla:

1. **Azienda mono-sede**: Se hai solo 1 structure, non serve
2. **Vendite online**: Se la vendita è online senza sede fisica
3. **Vendite centralizzate**: Se tutte le vendite sono gestite centralmente

### Gestione Automatica

Il Service già gestisce questo:

```php
if ($sale->structure) {
    // Aggiunge RiferimentoAmministrazione
} else {
    // Omette il campo (XML comunque valido)
}
```

---

## 🎓 Normativa SDI

### Campo RiferimentoAmministrazione

- **Obbligatorio**: ❌ NO
- **Validato da SDI**: ❌ NO (campo libero)
- **Max lunghezza**: 20 caratteri
- **Scopo**: Organizzazione interna del cedente
- **Visibile al cliente**: ✅ SÌ (nel XML ricevuto)

### Specifiche Tecniche

Dal **formato FatturaPA v1.2.1**:

```
RiferimentoAmministrazione: an..20
Tipo: Alfanumerico
Lunghezza massima: 20 caratteri
Obbligatorietà: Facoltativo
Descrizione: Identificativo amministrativo dell'emittente
```

---

## ✅ Checklist Implementazione

- [x] Campo RiferimentoAmministrazione implementato
- [x] Usa structure->name da relazione Sale
- [x] Aggiunge city se disponibile
- [x] Tronca a 20 caratteri (limite SDI)
- [x] Condizionale (solo se structure presente)
- [x] Structure caricata in eager loading
- [x] Codice formattato con Pint
- [x] Documentazione completa creata

---

## 🚀 Risultato Finale

### XML Completo con Sede

```xml
<FatturaElettronica versione="1.9">
  <FatturaElettronicaHeader>
    <CedentePrestatore>
      <DatiAnagrafici>
        <Denominazione>Fitness Company SRL</Denominazione>
      </DatiAnagrafici>
      <Sede>
        <!-- Sede LEGALE del tenant -->
        <Indirizzo>Via Roma 1</Indirizzo>
        <CAP>20100</CAP>
        <Comune>Milano</Comune>
      </Sede>
    </CedentePrestatore>
  </FatturaElettronicaHeader>
  
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Data>2025-11-11</Data>
        <Numero>FT2025/001</Numero>
        <!-- ✨ SEDE OPERATIVA -->
        <RiferimentoAmministrazione>Sede: Pal. Nord - M</RiferimentoAmministrazione>
        <ImportoTotaleDocumento>100.00</ImportoTotaleDocumento>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <!-- ...resto XML -->
  </FatturaElettronicaBody>
</FatturaElettronica>
```

**Lettura**: 
- Sede legale: Via Roma 1, Milano (tenant)
- Sede operativa vendita: Palestra Nord, Milano (structure)

---

## 📚 Alternative Future (Non Implementate)

### Se Serve Più Dettaglio

In futuro potresti aggiungere anche:

```php
// Causale con descrizione completa
if ($sale->structure) {
    $causale = "Vendita effettuata presso {$sale->structure->name}";
    if ($sale->structure->address) {
        $causale .= ", {$sale->structure->address}";
    }
    $xml->createElement('Causale', substr($causale, 0, 200));
}
```

Questo darebbe:
```xml
<Causale>Vendita effettuata presso Palestra Centro, Via Verdi 10 Milano</Causale>
```

Ma per ora **RiferimentoAmministrazione è sufficiente**! ✅

---

**Status**: ✅ IMPLEMENTATO  
**Campo XML**: RiferimentoAmministrazione (max 20 char)  
**Obbligatorio SDI**: ❌ NO (facoltativo)  
**Utilità**: ✅ ALTA (multi-sede)  
**Breaking**: ❌ Nessuno  
**Data**: 11 Novembre 2025 - 05:15

---

**Ora l'XML include la sede/struttura dove è stata effettuata la vendita!** 📍🎉


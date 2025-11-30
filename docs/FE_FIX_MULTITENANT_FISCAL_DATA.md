# 🔧 Fix Multi-Tenant: Dati Fiscali da Tenant (Database Centrale)

## Problema Risolto

**Errore**: "P.IVA o Codice Fiscale della struttura mancante"

**Causa Root**: Il Service cercava i dati fiscali nella tabella `structures` (database tenant), ma nell'architettura multi-tenant i dati fiscali sono memorizzati nella tabella `tenants` (database centrale).

---

## 🏗️ Architettura Multi-Tenant Corretta

### Database Centrale (`central`)
```
tenants (tabella centrale)
  - id (UUID)
  - name
  - vat_number ✅ (P.IVA azienda)
  - tax_code ✅ (CF azienda)
  - address ✅
  - city ✅
  - postal_code ✅
  - province
  - country
  - pec_email ✅
  - sdi_code ✅
  - fiscal_regime
```

### Database Tenant (`tenant_xxx`)
```
structures (tabella tenant)
  - id
  - name (es: "Palestra Centro", "Palestra Nord")
  - address (indirizzo operativo)
  - phone
  - email
  - NO vat_number (appartiene al tenant)
  - NO tax_code (appartiene al tenant)
```

### Relazione
```
1 Tenant (Azienda)
  └── N Structures (Sedi operative)
  
Esempio:
Tenant: "Fitness Company SRL" (P.IVA 12345678901)
  ├── Structure: "Palestra Centro" (Via Roma 1)
  ├── Structure: "Palestra Nord" (Via Milano 10)
  └── Structure: "Palestra Sud" (Via Napoli 5)
```

---

## ✅ Fix Applicato

### Modifiche a `ElectronicInvoiceService.php`

#### 1. generateXml() - Recupero Tenant
```php
// ❌ Prima
$structure = Structure::query()->first();
$this->validateSaleData($sale, $structure);
$this->buildXmlContent($sale, $structure, $transmissionId);

// ✅ Dopo
$tenant = \App\Models\Tenant::find(tenant('id')); // Database centrale
$structure = Structure::query()->first(); // Database tenant (per dati operativi)
$this->validateSaleData($sale, $tenant); // Valida dati fiscali tenant
$this->buildXmlContent($sale, $tenant, $structure, $transmissionId);
```

#### 2. buildXmlContent() - Firma aggiornata
```php
// ❌ Prima
protected function buildXmlContent(Sale $sale, Structure $structure, string $transmissionId)

// ✅ Dopo
protected function buildXmlContent(Sale $sale, $tenant, ?Structure $structure, string $transmissionId)
```

#### 3. buildDatiTrasmissione() - Usa Tenant
```php
// ❌ Prima
$idCodice = $structure->vat_number ?? $structure->tax_code;
$codiceDestinatario = $structure->sdi_code;
$pecDestinatario = $structure->pec_email;

// ✅ Dopo
$idCodice = $tenant->vat_number ?? $tenant->tax_code; // Da tenant!
$codiceDestinatario = $tenant->sdi_code;
$pecDestinatario = $tenant->pec_email;
```

#### 4. buildCedentePrestatore() - Tenant + Structure
```php
// ❌ Prima
protected function buildCedentePrestatore(\DOMDocument $xml, \DOMElement $header, Structure $structure)
{
    $vat = $structure->vat_number;
    $address = $structure->address;
}

// ✅ Dopo
protected function buildCedentePrestatore(\DOMDocument $xml, \DOMElement $header, $tenant, ?Structure $structure)
{
    // Dati fiscali da tenant
    $vat = $tenant->vat_number;
    $cf = $tenant->tax_code;
    $denominazione = $tenant->name;
    
    // Indirizzo da tenant (fallback a structure)
    $address = $tenant->address ?? ($structure->address ?? '');
    $cap = $tenant->postal_code ?? ($structure->postal_code ?? '');
    
    // Contatti da structure (operativi)
    $phone = $tenant->phone ?? ($structure->phone ?? null);
    $email = $tenant->email ?? ($structure->email ?? null);
}
```

#### 5. validateSaleData() - Valida Tenant
```php
// ❌ Prima
protected function validateSaleData(Sale $sale, Structure $structure): void
{
    if (!$structure->vat_number && !$structure->tax_code) {
        throw new \Exception('P.IVA o CF della struttura mancante');
    }
}

// ✅ Dopo
protected function validateSaleData(Sale $sale, $tenant): void
{
    if (!$tenant) {
        throw new \Exception('Tenant non trovato');
    }
    
    if (!$tenant->vat_number && !$tenant->tax_code) {
        throw new \Exception('P.IVA o CF del tenant mancante. Configurare i dati fiscali dell\'azienda.');
    }
}
```

#### 6. generateTransmissionId() - Usa Tenant
```php
// ❌ Prima
protected function generateTransmissionId(Structure $structure): string
{
    $prefix = substr($structure->vat_number ?? $structure->tax_code, 0, 5);
}

// ✅ Dopo
protected function generateTransmissionId($tenant): string
{
    $prefix = substr($tenant->vat_number ?? $tenant->tax_code ?? 'IT', 0, 5);
}
```

---

## 📋 Cosa Viene da Dove

### XML FatturaPA - Sezione CedentePrestatore (Venditore)

| Campo XML | Fonte Dato | Tabella | Note |
|-----------|------------|---------|------|
| `IdFiscaleIVA/IdCodice` | **P.IVA** | `tenants.vat_number` | ✅ Obbligatorio azienda |
| `CodiceFiscale` | **CF** | `tenants.tax_code` | Se diverso da P.IVA |
| `Denominazione` | **Ragione Sociale** | `tenants.name` | Nome azienda |
| `RegimeFiscale` | **Regime** | `tenants.fiscal_regime` | Default: RF01 |
| `Sede/Indirizzo` | **Indirizzo** | `tenants.address` | Fallback: `structures.address` |
| `Sede/CAP` | **CAP** | `tenants.postal_code` | Fallback: `structures.postal_code` |
| `Sede/Comune` | **Città** | `tenants.city` | Fallback: `structures.city` |
| `Sede/Provincia` | **Provincia** | `tenants.province` | Fallback: `structures.province` |
| `Sede/Nazione` | **Paese** | `tenants.country` | Default: IT |
| `Contatti/Telefono` | **Tel** | `tenants.phone` | Fallback: `structures.phone` |
| `Contatti/Email` | **Email** | `tenants.email` | Fallback: `structures.email` |

### XML FatturaPA - Sezione DatiTrasmissione

| Campo XML | Fonte Dato | Tabella |
|-----------|------------|---------|
| `IdTrasmittente/IdCodice` | **P.IVA** | `tenants.vat_number` |
| `CodiceDestinatario` | **Codice SDI** | `tenants.sdi_code` |
| `PECDestinatario` | **PEC** | `tenants.pec_email` |

---

## 🎯 Comportamento Corretto

### Scenario 1: Tenant con Dati Completi
```php
Tenant:
  - name: "Fitness Company SRL"
  - vat_number: "12345678901"
  - address: "Via Roma 1, Milano"
  - pec_email: "pec@fitness.it"

Structure:
  - name: "Palestra Centro"
  - address: "Via Verdi 10, Milano" (sede operativa)
  - phone: "02 12345678"

XML Generato:
  <CedentePrestatore>
    <DatiAnagrafici>
      <IdFiscaleIVA>
        <IdCodice>12345678901</IdCodice> <!-- Da TENANT ✅ -->
      </IdFiscaleIVA>
      <Denominazione>Fitness Company SRL</Denominazione> <!-- Da TENANT ✅ -->
    </DatiAnagrafici>
    <Sede>
      <Indirizzo>Via Roma 1</Indirizzo> <!-- Da TENANT (sede legale) ✅ -->
      <Comune>Milano</Comune>
    </Sede>
    <Contatti>
      <Telefono>02 12345678</Telefono> <!-- Da STRUCTURE (operativo) ✅ -->
    </Contatti>
  </CedentePrestatore>
```

### Scenario 2: Tenant senza Indirizzo (Fallback)
```php
Tenant:
  - name: "Fitness Company SRL"
  - vat_number: "12345678901"
  - address: NULL

Structure:
  - name: "Palestra Centro"
  - address: "Via Verdi 10, Milano"

XML Generato:
  <Sede>
    <Indirizzo>Via Verdi 10</Indirizzo> <!-- Fallback a STRUCTURE ✅ -->
  </Sede>
```

---

## ✅ Validazioni Aggiornate

### Pre-Generazione Fattura Elettronica

#### Dati Tenant Obbligatori
- ✅ `vat_number` O `tax_code` (almeno uno)
- ℹ️ `address`, `city`, `postal_code` (raccomandati, fallback a structure)
- ℹ️ `pec_email` O `sdi_code` (almeno uno raccomandato)

#### Dati Customer Obbligatori
- ✅ `vat_number` (aziende) O `tax_code` (privati)
- ✅ `company_name` (aziende) O `first_name` + `last_name` (privati)
- ✅ `address`, `city`, `postal_code`

#### Messaggio Errore Migliorato
```
❌ Prima: "P.IVA o Codice Fiscale della struttura mancante"
✅ Dopo: "P.IVA o Codice Fiscale del tenant mancante. Configurare i dati fiscali dell'azienda."
```

---

## 📊 Impatto e Testing

### File Modificati
- ✅ `app/Services/Sale/ElectronicInvoiceService.php`
  - 6 metodi aggiornati
  - Firma buildXmlContent cambiata
  - Validazione tenant-aware

### Backward Compatibility
✅ **Compatibile**: Le vendite esistenti continuano a funzionare  
✅ **Migration**: Non richiesta (usa tabelle esistenti)  
✅ **Fallback**: Indirizzo da structure se tenant non ha

### Test Manuale
```bash
# 1. Verifica dati tenant
php artisan tinker
$tenant = App\Models\Tenant::find(tenant('id'));
echo "VAT: " . $tenant->vat_number;
echo "Address: " . $tenant->address;
exit

# 2. Se mancanti, popola
php artisan tinker
$tenant = App\Models\Tenant::find(tenant('id'));
$tenant->update([
    'vat_number' => '12345678901',
    'tax_code' => 'IT12345678901',
    'address' => 'Via Roma 1',
    'city' => 'Milano',
    'postal_code' => '20100',
    'pec_email' => 'pec@example.it',
]);
exit

# 3. Genera fattura test
# Vai su vendita e click "Genera Fattura Elettronica"
# ✅ Dovrebbe funzionare!
```

---

## 🎓 Best Practice Multi-Tenant

### 1. Dati Fiscali → Tenant (Centrale)
```
✅ P.IVA
✅ Codice Fiscale
✅ Ragione Sociale
✅ Regime Fiscale
✅ PEC/SDI Code
✅ Sede Legale
```

### 2. Dati Operativi → Structure (Tenant DB)
```
✅ Nome sede
✅ Indirizzo operativo
✅ Telefono locale
✅ Email locale
✅ Orari apertura
✅ Manager sede
```

### 3. XML Fattura Elettronica
```
Cedente = TENANT (azienda)
  - Sempre stesso P.IVA per tutte le structure
  - Sede legale da tenant
  
Contatti = STRUCTURE o TENANT
  - Telefono/Email operativi se presenti in structure
  - Altrimenti usa dati tenant
```

---

## 💡 Configurazione Tenant

### UI Consigliata (TODO Futuro)
Creare pagina "Dati Azienda" nel database centrale:

```
/settings/company (route centrale, no tenant middleware)

Campi form:
- Ragione Sociale
- P.IVA
- Codice Fiscale
- Regime Fiscale (select: RF01, RF02, etc.)
- Indirizzo Sede Legale
- CAP, Città, Provincia
- PEC Email
- Codice Destinatario SDI
```

### Validazione Form
```php
public function rules(): array
{
    return [
        'vat_number' => 'required_without:tax_code|size:11',
        'tax_code' => 'required_without:vat_number|size:16',
        'name' => 'required|string|max:255',
        'address' => 'required|string',
        'city' => 'required|string',
        'postal_code' => 'required|string|size:5',
        'pec_email' => 'nullable|email',
        'sdi_code' => 'nullable|string|size:7',
    ];
}
```

---

## ✅ Checklist Verifica Fix

- [x] Service aggiornato per usare Tenant
- [x] Tenant recuperato da database centrale
- [x] Validazione aggiornata (tenant invece di structure)
- [x] buildXmlContent usa tenant per dati fiscali
- [x] buildCedentePrestatore ha fallback structure per indirizzi
- [x] generateTransmissionId usa tenant
- [x] Messaggio errore migliorato
- [x] Codice formattato con Pint
- [x] Documentazione creata

---

## 🚀 Prossimo Step

### Popola Dati Tenant (ADESSO)
```bash
php artisan tinker

# Trova il tuo tenant
$tenant = App\Models\Tenant::find('TUO_TENANT_ID');

# Popola dati fiscali
$tenant->update([
    'vat_number' => '12345678901', // P.IVA azienda
    'tax_code' => 'IT12345678901', // CF (se diverso)
    'address' => 'Via Roma 1',
    'city' => 'Milano',
    'postal_code' => '20100',
    'province' => 'MI',
    'country' => 'IT',
    'pec_email' => 'pec@tuaazienda.it',
    'sdi_code' => null, // O codice destinatario
    'fiscal_regime' => 'RF01', // Regime ordinario
]);

exit
```

### Testa Generazione
1. Vai su una vendita (status: saved)
2. Click "Genera Fattura Elettronica"
3. ✅ Dovrebbe funzionare senza errori!
4. Verifica XML scaricato contiene P.IVA corretta

---

## 📚 Riferimenti

- **Fix principale**: `ElectronicInvoiceService.php` (6 metodi modificati)
- **Model Tenant**: `app/Models/Tenant.php`
- **Documentazione**: `docs/FE_FIX_MULTITENANT_FISCAL_DATA.md` (questo file)

---

**Status Fix**: ✅ COMPLETATO + CUSTOMER FIELDS STANDARDIZED  
**Testato**: ⏳ Richiede dati tenant popolati  
**Breaking Changes**: ❌ Nessuno (backward compatible con tax_id_code)  
**Data**: 11 Novembre 2025 - 04:30

---

## ✅ BONUS FIX: Campi Customer Standardizzati

### Problema
I campi della tabella `customers` non erano allineati allo standard fatturazione elettronica:
- `tax_id_code` invece di `tax_code`
- Mancava `vat_number` per le aziende
- Mancava `company_name` per le ragioni sociali

### Soluzione Applicata

#### Migration Aggiunta
**File**: `2025_11_11_042000_add_fiscal_fields_to_customers_table.php`

Campi aggiunti:
- ✅ `company_name` - Ragione sociale (aziende)
- ✅ `vat_number` - P.IVA (aziende)
- ✅ `tax_code` - Alias per tax_id_code (compatibilità)

#### Service Aggiornato
**buildCessionarioCommittente()** ora supporta:
- ✅ `tax_code` E `tax_id_code` (fallback automatico)
- ✅ `company_name` per aziende
- ✅ `street` + `number` per indirizzo composto
- ✅ `zip` E `postal_code` (fallback)
- ✅ Detection automatica azienda/privato

#### Validazione Flessibile
```php
$hasFiscalData = $customer->vat_number 
    || $customer->tax_code 
    || $customer->tax_id_code; // Fallback legacy
```

### Mapping Campi Customer

| XML Campo | Customer Field (Nuovo) | Fallback Legacy | Note |
|-----------|------------------------|-----------------|------|
| `CodiceFiscale` | `tax_code` | `tax_id_code` | ✅ Entrambi supportati |
| `IdFiscaleIVA` | `vat_number` | - | Solo aziende |
| `Denominazione` | `company_name` | `first_name + last_name` | Se azienda |
| `Nome` | `first_name` | - | Se privato |
| `Cognome` | `last_name` | - | Se privato |
| `Indirizzo` | `street + number` | `address` | Composito o singolo |
| `CAP` | `zip` | `postal_code` | ✅ Entrambi |
| `Comune` | `city` | - | |
| `Provincia` | `province` | - | |
| `Nazione` | `country` | Default: IT | |

---

**Ora puoi generare fatture elettroniche con i dati fiscali corretti dal Tenant e Customer standardizzati!** 🎉


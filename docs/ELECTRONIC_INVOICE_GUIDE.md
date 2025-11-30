# Guida Fatturazione Elettronica - FS Gymme

## Stato Implementazione

### ✅ Completato
- **Service**: `ElectronicInvoiceService` implementato al 95%
- **Models**: Sale, ElectronicInvoice, DocumentTypeElectronicInvoice
- **Database**: Tabelle complete con tutti i campi necessari
- **Enum**: ElectronicInvoiceStatusEnum definito

### 🚧 Da Completare
- Controller per generazione XML
- Frontend bottone "Genera Fattura"
- Integrazione con provider SDI (Aruba/InfoCert)
- Webhook notifiche SDI
- PDF rappresentazione tabellare

## Normativa Italiana 2025

### Obbligo Legale
- **B2B e B2C**: Obbligatoria per TUTTE le transazioni
- **Formato**: XML FatturaPA v1.9 (valida fino al 2027)
- **SDI**: Sistema di Interscambio Agenzia delle Entrate
- **Sanzioni**: Da 250€ a 2000€ per fattura non elettronica

### Conservazione Digitale
- **Durata**: 10 anni obbligatori (normativa fiscale)
- **Integrità**: Hash SHA-256 per verifica non alterazione
- **Firma**: Digitale o marca temporale
- **Provider**: Aruba, InfoCert, Namirial, AgE (gratuito)

## Codici Documento Principali

```
TD01 - Fattura ordinaria
TD04 - Nota di Credito
TD05 - Nota di Debito
TD06 - Parcella professionale
TD16 - Integrazione reverse charge
TD20 - Autofattura regolarizzazione
TD24 - Fattura differita
TD29 - Irregolarità fatturazione (nuovo v1.9 2025)
```

## Regimi Fiscali

```
RF01 - Ordinario (default palestre/SSD)
RF18 - Forfetario L.190/2014
RF19 - Forfetario L.160/2019
RF20 - Esenzione IVA transfrontaliera (nuovo v1.9 2025)
```

## Natura IVA (Operazioni Esenti/Non Imponibili)

```
N1   - Escluse ex art.15
N2.1 - Non soggette IVA artt.7-7septies
N3.1 - Non imponibili - esportazioni
N3.2 - Non imponibili - cessioni UE
N4   - Esenti
N6.3 - Reverse charge subappalto edile
N7   - IVA assolta in altro Stato UE
```

## Struttura XML Generato

### Root
```xml
<p:FatturaElettronica versione="1.9" 
  xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.9">
```

### Header - DatiTrasmissione
```xml
<DatiTrasmissione>
  <IdTrasmittente>
    <IdPaese>IT</IdPaese>
    <IdCodice>12345678901</IdCodice>
  </IdTrasmittente>
  <ProgressivoInvio>PREFIX_20251111123456_ABC12</ProgressivoInvio>
  <FormatoTrasmissione>FPR12</FormatoTrasmissione>
  <CodiceDestinatario>0000000</CodiceDestinatario>
  <PECDestinatario>cliente@pec.it</PECDestinatario>
</DatiTrasmissione>
```

**Note**:
- `FormatoTrasmissione`: FPR12 (privati), FPA12 (PA)
- `CodiceDestinatario`: 7 caratteri canale SDI, o "0000000" se PEC
- `ProgressivoInvio`: Univoco per trasmissione

### Header - CedentePrestatore (Venditore)
```xml
<CedentePrestatore>
  <DatiAnagrafici>
    <IdFiscaleIVA>
      <IdPaese>IT</IdPaese>
      <IdCodice>12345678901</IdCodice>
    </IdFiscaleIVA>
    <CodiceFiscale>RSSMRA80A01H501U</CodiceFiscale>
    <Anagrafica>
      <Denominazione>Palestra Fitness SSD</Denominazione>
    </Anagrafica>
    <RegimeFiscale>RF01</RegimeFiscale>
  </DatiAnagrafici>
  <Sede>
    <Indirizzo>Via Roma 123</Indirizzo>
    <CAP>00100</CAP>
    <Comune>Roma</Comune>
    <Provincia>RM</Provincia>
    <Nazione>IT</Nazione>
  </Sede>
</CedentePrestatore>
```

### Header - CessionarioCommittente (Cliente)
```xml
<CessionarioCommittente>
  <DatiAnagrafici>
    <IdFiscaleIVA>
      <IdPaese>IT</IdPaese>
      <IdCodice>98765432109</IdCodice>
    </IdFiscaleIVA>
    <CodiceFiscale>RSSMRA80A01H501U</CodiceFiscale>
    <Anagrafica>
      <Nome>Mario</Nome>
      <Cognome>Rossi</Cognome>
    </Anagrafica>
  </DatiAnagrafici>
  <Sede>
    <Indirizzo>Via Milano 45</Indirizzo>
    <CAP>20100</CAP>
    <Comune>Milano</Comune>
    <Provincia>MI</Provincia>
    <Nazione>IT</Nazione>
  </Sede>
</CessionarioCommittente>
```

**Note**:
- Per aziende: usare `<Denominazione>`
- Per privati: usare `<Nome>` + `<Cognome>`
- Almeno uno tra IdFiscaleIVA e CodiceFiscale obbligatorio

### Body - DatiGeneraliDocumento
```xml
<DatiGeneraliDocumento>
  <TipoDocumento>TD01</TipoDocumento>
  <Divisa>EUR</Divisa>
  <Data>2025-11-11</Data>
  <Numero>FT2025/0001</Numero>
  <ImportoTotaleDocumento>244.00</ImportoTotaleDocumento>
  <Causale>Abbonamento annuale</Causale>
</DatiGeneraliDocumento>
```

### Body - DettaglioLinee (Righe)
```xml
<DettaglioLinee>
  <NumeroLinea>1</NumeroLinea>
  <Descrizione>Abbonamento Annuale Gold</Descrizione>
  <Quantita>1.00</Quantita>
  <UnitaMisura>PZ</UnitaMisura>
  <PrezzoUnitario>200.00</PrezzoUnitario>
  <PrezzoTotale>200.00</PrezzoTotale>
  <AliquotaIVA>22.00</AliquotaIVA>
</DettaglioLinee>
```

**Con sconto**:
```xml
<DettaglioLinee>
  <NumeroLinea>2</NumeroLinea>
  <Descrizione>Personal Training 10 sessioni</Descrizione>
  <Quantita>1.00</Quantita>
  <PrezzoUnitario>500.00</PrezzoUnitario>
  <ScontoMaggiorazione>
    <Tipo>SC</Tipo>
    <Percentuale>10.00</Percentuale>
  </ScontoMaggiorazione>
  <PrezzoTotale>450.00</PrezzoTotale>
  <AliquotaIVA>22.00</AliquotaIVA>
</DettaglioLinee>
```

### Body - DatiRiepilogo (Riepilogo IVA)
```xml
<DatiRiepilogo>
  <AliquotaIVA>22.00</AliquotaIVA>
  <ImponibileImporto>200.00</ImponibileImporto>
  <Imposta>44.00</Imposta>
  <EsigibilitaIVA>I</EsigibilitaIVA>
</DatiRiepilogo>
```

**Per IVA 0% (esente)**:
```xml
<DatiRiepilogo>
  <AliquotaIVA>0.00</AliquotaIVA>
  <Natura>N4</Natura>
  <ImponibileImporto>100.00</ImponibileImporto>
  <Imposta>0.00</Imposta>
  <RiferimentoNormativo>Art.10 DPR 633/72</RiferimentoNormativo>
</DatiRiepilogo>
```

### Body - DatiPagamento
```xml
<DatiPagamento>
  <CondizioniPagamento>TP02</CondizioniPagamento>
  <DettaglioPagamento>
    <ModalitaPagamento>MP05</ModalitaPagamento>
    <DataScadenzaPagamento>2025-11-25</DataScadenzaPagamento>
    <ImportoPagamento>244.00</ImportoPagamento>
  </DettaglioPagamento>
</DatiPagamento>
```

**CondizioniPagamento**:
- TP01: Pagamento a rate
- TP02: Pagamento completo
- TP03: Anticipato

**ModalitaPagamento**:
- MP01: Contanti
- MP02: Assegno
- MP05: Bonifico bancario
- MP08: Carta di credito/debito
- MP12: RIBA
- MP19: SEPA Direct Debit

## Utilizzo del Service

### Generare XML
```php
use App\Services\Sale\ElectronicInvoiceService;

$service = new ElectronicInvoiceService();
$electronicInvoice = $service->generateXml($sale);

// XML salvato in: storage/app/electronic_invoices/{transmission_id}.xml
// Record ElectronicInvoice creato con status GENERATED
```

### Validazioni Automatiche
Il service valida automaticamente:
- ✅ Presenza P.IVA o CF struttura
- ✅ Presenza P.IVA o CF cliente
- ✅ Presenza righe vendita
- ✅ Numero progressivo fattura
- ✅ XML well-formed

### Campi Obbligatori Database

**Structure (Cedente)**:
- `vat_number` o `tax_code` (almeno uno)
- `company_name` o `name`
- `address`, `postal_code`, `city`, `province`
- `fiscal_regime` (default: RF01)

**Customer (Cessionario)**:
- `vat_number` o `tax_code` (almeno uno)
- `company_name` (se azienda) o `first_name` + `last_name` (se privato)
- `address`, `postal_code`, `city`
- `country_code` (default: IT)

**Sale**:
- `progressive_number` (univoco per anno)
- `date`
- `document_type_electronic_invoice_id`
- `customer_id`
- Almeno una `sale_row`

## Prossimi Step Implementazione

### 1. Controller (PRIORITÀ ALTA)
```php
// app/Http/Controllers/Application/Sales/ElectronicInvoice/GenerateController.php
public function __invoke(Sale $sale): RedirectResponse
{
    $service = new ElectronicInvoiceService();
    
    try {
        $electronicInvoice = $service->generateXml($sale);
        
        return redirect()->back()->with('success', 'Fattura elettronica generata');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', $e->getMessage());
    }
}
```

### 2. Routes
```php
// routes/tenant/web/sales.php
Route::post('sales/{sale}/electronic-invoice/generate', 
    GenerateController::class)
    ->name('app.sales.electronic-invoice.generate');

Route::get('sales/{sale}/electronic-invoice/download-xml', 
    DownloadXmlController::class)
    ->name('app.sales.electronic-invoice.download-xml');
```

### 3. Frontend - Bottone in Sale Detail
```tsx
// Sale Detail Page
{sale.status === 'completed' && !sale.electronic_invoice && (
  <Button 
    variant="contained" 
    onClick={() => router.post(
      route('app.sales.electronic-invoice.generate', { 
        sale: sale.id, 
        tenant: currentTenantId 
      })
    )}
  >
    Genera Fattura Elettronica
  </Button>
)}

{sale.electronic_invoice && (
  <>
    <Chip 
      label={sale.electronic_invoice.sdi_status} 
      color="success" 
    />
    <Button 
      variant="outlined"
      href={route('app.sales.electronic-invoice.download-xml', {
        sale: sale.id,
        tenant: currentTenantId
      })}
    >
      Scarica XML
    </Button>
  </>
)}
```

### 4. Integrazione SDI/Provider

#### Opzione A: Aruba Fatturazione Elettronica
```php
// config/services.php
'aruba' => [
    'username' => env('ARUBA_USERNAME'),
    'password' => env('ARUBA_PASSWORD'),
    'endpoint' => env('ARUBA_ENDPOINT', 'https://ws.aruba.it/FatturazioneElettronica/Service.svc'),
],

// Service method
public function sendToSdi(ElectronicInvoice $electronicInvoice): bool
{
    $client = new SoapClient(config('services.aruba.endpoint'));
    
    $response = $client->Send([
        'Username' => config('services.aruba.username'),
        'Password' => config('services.aruba.password'),
        'DataFile' => base64_encode($electronicInvoice->xml_content),
        'DataFileName' => $electronicInvoice->transmission_id . '.xml',
    ]);
    
    if ($response->SendResult->Success) {
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::SENT,
            'sdi_sent_at' => now(),
        ]);
        return true;
    }
    
    return false;
}
```

#### Opzione B: Invio Diretto PEC
```php
use Illuminate\Support\Facades\Mail;

public function sendViaPec(ElectronicInvoice $electronicInvoice): void
{
    Mail::send([], [], function ($message) use ($electronicInvoice) {
        $message->to('sdi01@pec.fatturapa.it')
            ->subject('Fattura Elettronica')
            ->attach(
                storage_path('app/' . $electronicInvoice->xml_file_path),
                ['as' => $electronicInvoice->transmission_id . '.xml']
            );
    });
    
    $electronicInvoice->update([
        'sdi_status' => ElectronicInvoiceStatusEnum::SENT,
        'sdi_sent_at' => now(),
    ]);
}
```

### 5. Gestione Notifiche SDI

Stati possibili:
- **RC**: Ricevuta Consegna (OK)
- **NS**: Notifica Scarto (KO)
- **MC**: Mancata Consegna (KO)
- **NE**: Notifica Esito (Cliente ha accettato/rifiutato)
- **DT**: Decorrenza Termini (OK dopo 15gg)
- **AT**: Attestazione Trasmissione con impossibilità di recapito

```php
// Webhook controller
public function handleSdiNotification(Request $request): Response
{
    $xml = $request->getContent();
    $dom = new \DOMDocument();
    $dom->loadXML($xml);
    
    $notificationType = $dom->getElementsByTagName('NomeFile')->item(0)->nodeValue;
    $transmissionId = $this->extractTransmissionId($notificationType);
    
    $electronicInvoice = ElectronicInvoice::where('transmission_id', $transmissionId)->first();
    
    if ($notificationType === 'RC') {
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::ACCEPTED,
            'sdi_received_at' => now(),
        ]);
    } elseif ($notificationType === 'NS') {
        $errors = $this->extractErrors($dom);
        $electronicInvoice->update([
            'sdi_status' => ElectronicInvoiceStatusEnum::REJECTED,
            'sdi_error_messages' => $errors,
        ]);
    }
    
    return response()->noContent();
}
```

## Testing

### Test Unitario Service
```php
use Tests\TestCase;

test('generates valid XML for simple sale', function () {
    $tenant = $this->createTenantWithDatabase();
    $this->initializeTenancy($tenant);
    
    $structure = Structure::factory()->create([
        'vat_number' => '12345678901',
        'company_name' => 'Test Gym SSD',
    ]);
    
    $customer = Customer::factory()->create([
        'tax_code' => 'RSSMRA80A01H501U',
        'first_name' => 'Mario',
        'last_name' => 'Rossi',
    ]);
    
    $sale = Sale::factory()->create([
        'customer_id' => $customer->id,
        'progressive_number' => 'FT2025/0001',
    ]);
    
    $service = new ElectronicInvoiceService();
    $electronicInvoice = $service->generateXml($sale);
    
    expect($electronicInvoice->xml_content)
        ->toContain('<TipoDocumento>TD01</TipoDocumento>')
        ->toContain('RSSMRA80A01H501U');
    
    $this->endTenancy();
});
```

## Errori Comuni e Soluzioni

### Errore: "P.IVA o CF mancante"
**Causa**: Structure o Customer non hanno dati fiscali
**Soluzione**: Compilare `vat_number` o `tax_code` in anagrafica

### Errore: "XML non valido"
**Causa**: Caratteri speciali non escapati
**Soluzione**: Il DOMDocument gestisce automaticamente, verificare dati input

### Errore SDI: Codice 00300
**Causa**: IdCodice trasmittente non valido
**Soluzione**: Verificare P.IVA struttura in Anagrafe Tributaria

### Errore SDI: Codice 00305
**Causa**: IdCodice cliente non valido
**Soluzione**: Verificare P.IVA/CF cliente

### Errore SDI: Codice 00311
**Causa**: CodiceDestinatario non valido
**Soluzione**: Verificare codice SDI cliente o usare "0000000" + PEC

## Risorse Utili

- **Specifiche Tecniche v1.9**: In `ftt-docs/Allegato A - Specifiche tecniche vers 1.9.pdf`
- **Agenzia Entrate**: https://www.agenziaentrate.gov.it/portale/fattura-elettronica
- **Forum SDI**: https://forum.agenziaentrate.gov.it
- **Test XML**: https://sdi.fatturapa.gov.it/SdI2FatturaPAWeb/AccediAlServizioAction.do?pagina=controlla_fattura

## Contatti Provider

**Aruba**: https://www.pec.it/Fatturazione-Elettronica.aspx
**InfoCert**: https://fatturazione-elettronica.infocert.it
**AgE (Gratuito)**: Conservazione tramite portale Fatture e Corrispettivi


# Implementazione Note di Credito (TD04)

**Data completamento**: 21 Novembre 2025
**Versione**: 1.0

## Panoramica

Implementata la funzionalità completa per generare Note di Credito (TD04) da fatture elettroniche accettate dal SDI, seguendo le specifiche del formato FatturaPA.

## Caratteristiche Principali

### 1. Creazione Note di Credito

- **Trigger**: Pulsante nella pagina dettaglio vendita, visibile solo per fatture con SDI status "accepted"
- **Validazioni**:
  - Fattura deve avere electronic_invoice
  - SDI status deve essere "accepted"
  - Non si possono creare note di credito da altre note di credito
- **Comportamento**: Crea una nuova vendita (Sale) con `type = 'credit_note'`

### 2. Struttura Dati

#### Sale Model
```php
'type' => 'credit_note'  // vs 'invoice' per fatture normali
'original_sale_id' => $originalSaleId  // FK alla fattura originale
'document_type_id' => 4  // Nota di credito
'document_type_electronic_invoice_id' => TD04  // Codice FatturaPA
```

#### Valori nelle Righe
**IMPORTANTE**: Tutti i valori devono essere POSITIVI
- Quantity: positiva
- Prices: positivi
- Totals: positivi

Il tipo documento TD04 comunica al SDI che si tratta di uno storno, quindi il sistema interpreta automaticamente i valori positivi come importi da sottrarre.

#### Campi a Livello Vendita
Anche stamp_duty_amount, withholding_tax_amount, welfare_fund_amount sono copiati con valori POSITIVI.

### 3. XML Generato

#### DatiFattureCollegate
Il blocco XML che referenzia la fattura originale:

```xml
<DatiFattureCollegate>
    <IdDocumento>2025/042</IdDocumento>
    <Data>2025-11-20</Data>
</DatiFattureCollegate>
```

- **IdDocumento**: progressive_number della fattura originale (es. "2025/042")
- **Data**: data di emissione della fattura originale

### 4. Interfaccia Utente

#### Tabella Index (sale-index.tsx)
- **Colonna "Tipo"**: Chip rosso "Nota di Credito" vs chip outlined "Fattura"
- **Icona dinamica**: CreditCard rossa per NC, Receipt grigia per fatture

#### Pagina Dettaglio (sale-show.tsx)
- **Header rosso**: Gradiente rosso (#ef4444 → #dc2626) per note di credito
- **Badge prominente**: "NOTA DI CREDITO" bianco su sfondo rosso
- **Riferimento originale**: "Storno di: Fattura #2025/042"

### 5. Workflow Completo

1. **Creazione**: Utente clicca su pulsante "Genera Nota di Credito" dalla fattura accettata
2. **Duplicazione**: Sistema crea nuova Sale con tipo credit_note e valori positivi
3. **Modifica opzionale**: Utente può modificare quantità/prezzi per storni parziali
4. **XML Generation**: Sistema genera XML con TD04 e blocco DatiFattureCollegate
5. **Invio SDI**: Utente invia la nota di credito al SDI come normale fattura

## File Modificati

### Backend

**CreditNoteController.php** (nuovo)
- `app/Http/Controllers/Application/Sales/CreditNoteController.php`
- Gestisce la creazione delle note di credito
- Valida prerequisiti (electronic invoice, accepted status)
- Duplica sale e righe con valori positivi

**ElectronicInvoiceService.php**
- Aggiunto `buildDatiFattureCollegate()` per blocco XML
- Chiamato automaticamente per type='credit_note'

**SaleService.php**
- Aggiunto `mapElectronicInvoiceToDocumentType()` per mappare TD codes a document_types
- Popolamento automatico di document_type_id

**SaleController.php**
- Aggiunto eager loading di `original_sale` nel metodo show()
- Aggiunto campo `type` nel mapping index()

**Sale.php Model**
- Aggiunta relazione `original_sale()` per FK
- Aggiunta relazione `credit_notes()` per reverse

### Frontend

**sale-index.tsx**
- Nuova colonna "Tipo" con chip colorato
- Icona dinamica per numero documento

**sale-show.tsx**
- Header con colore dinamico (rosso per NC)
- Badge "NOTA DI CREDITO"
- Riferimento fattura originale

### Routes

```php
Route::post('sales/{sale}/credit-note', CreditNoteController::class)
    ->name('app.sales.credit-note');
```

## Testing

### Test Manuale
1. Creare una vendita con fattura elettronica
2. Generare XML e inviare al SDI
3. Attendere accettazione (status "accepted")
4. Cliccare su "Genera Nota di Credito"
5. Verificare creazione con valori positivi
6. Generare XML della nota di credito
7. Verificare presenza blocco DatiFattureCollegate
8. Inviare al SDI

### Validazioni Schema
- XML conforme a schema FPR12
- Pattern quantità: `[0-9]{1,12}\.[0-9]{2,8}` (solo positivi)
- TD04 correttamente identificato

## Note Tecniche

### Perché Valori Positivi?

Contrariamente all'intuizione, il formato FatturaPA richiede valori POSITIVI nelle note di credito:
- Il campo `TipoDocumento = TD04` identifica il documento come nota di credito
- Il SDI interpreta automaticamente i valori positivi come storni
- Lo schema XML non accetta valori negativi (pattern validation)

### Storni Parziali

L'utente può modificare la nota di credito prima dell'invio per gestire storni parziali:
1. Ridurre quantità di alcune righe
2. Rimuovere righe non da stornare
3. Il sistema ricalcola automaticamente i totali

### Progressive Numbering

Le note di credito hanno una numerazione progressiva separata dalle fatture, gestita dal `ProgressiveNumberService`.

## Prossimi Sviluppi

### Possibili Miglioramenti
- [ ] Filtro "Tipo Documento" nella tabella index
- [ ] Dashboard widget per statistiche NC
- [ ] Report mensile note di credito vs fatture
- [ ] Email automatica al cliente per NC accettata
- [ ] Link dalla NC alla fattura originale e viceversa

### Considerazioni Future
- Quando si implementeranno DDT e Preventivi, valutare refactoring completo a sistema "Documents" unificato
- Per ora, l'approccio minimale con type='credit_note' è sufficiente

## Riferimenti

- [Specifiche FatturaPA v1.2.2](https://www.fatturapa.gov.it/export/documenti/fatturapa/v1.2.2/Specifiche_tecniche_del_formato_FatturaPA_v1.2.2.pdf)
- [Codici Tipo Documento](https://www.agenziaentrate.gov.it/portale/web/guest/schede/comunicazioni/fatture-e-corrispettivi/codici-td)
- TD04: Nota di credito - art. 26 c.3 D.P.R. 633/72

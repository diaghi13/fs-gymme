# Frontend VAT Refactoring TODO

## 📋 Modifiche Database Completate ✅
- `sales.tax_included` (boolean) - indica se prezzi mostrati sono IVA inclusa
- `sale_rows.unit_price` → `sale_rows.unit_price_net` (prezzo NETTO)
- `sale_rows.total` → `sale_rows.total_net` (totale NETTO)

## ✅ Componenti Aggiornati

### Visualizzazione (sale-show)
- [x] `sale-show.tsx` - Layout redesigned, fattura elettronica in alto
- [x] `SaleRowsCard.tsx` - Usa `unit_price_net` e `total_net`, mostra lordo/netto
- [x] `SaleTotalsCard.tsx` - Già aggiornato (usa `sale_summary`)
- [x] `SaleVatBreakdownCard.tsx` - Già aggiornato (usa `vat_breakdown`)

### TypeScript Types
- [x] `types/index.d.ts` - Sale e SaleRow interfaces aggiornati

## 🔄 Componenti da Aggiornare (Creazione Vendita)

### PRIORITÀ ALTA - Bloccanti per creare vendite

#### 1. `/resources/js/pages/sales/sale-create.tsx`
**Modifiche necessarie:**
- Aggiungere campo `tax_included` (default: true)
- Nel submit, inviare `tax_included` insieme ai dati vendita
- I prezzi dal carrello sono già gestiti dal frontend come "prezzi mostrati"
- Il backend (`SaleService`) farà lo scorporo IVA automaticamente

**Codice da aggiungere:**
```tsx
// Nel form iniziale values
const [taxIncluded, setTaxIncluded] = useState(true);

// Nel submit
const submitData = {
  ...formData,
  tax_included: taxIncluded,  // Aggiungere questo
  sale_rows: cartItems.map(item => ({
    ...item,
    unit_price: item.unit_price,  // Il prezzo "come mostrato" (lordo se tax_included=true)
  }))
};
```

**NOTA IMPORTANTE:** I prezzi nel carrello sono già "prezzi mostrati" (lordi se IVA inclusa). Il backend si occupa dello scorporo automaticamente quando `tax_included = true`.

#### 2. `/resources/js/Contexts/Sale/SaleContext.tsx`
**Modifiche necessarie:**
- Questo context gestisce i calcoli in tempo reale del carrello
- Attualmente usa `unit_price` e calcola totali
- **NON SERVE MODIFICARE** per ora - i calcoli sono fatti sul "prezzo mostrato"
- Il backend convertirà in netto al momento del salvataggio

**Quando modificare in futuro:**
- Se vogliamo mostrare sia netto che lordo in tempo reale nel carrello
- Se vogliamo permettere switch tra "mostra IVA inclusa/esclusa" in UI

#### 3. `/resources/js/components/sales/Cart.tsx`
**Stato:** Da verificare se usa `unit_price` o `total` direttamente
**Modifiche:** Probabilmente nessuna - mostra solo i prezzi "come inseriti"

#### 4. `/resources/js/components/sales/CartItem.tsx`
**Stato:** Da verificare
**Modifiche:** Probabilmente nessuna - mostra solo i dati del context

### PRIORITÀ MEDIA - Visualizzazione altri componenti

#### 5. `/resources/js/pages/sales/components/CartSidebar.tsx`
**Modifiche:** Verificare se accede direttamente a fields `unit_price`/`total`

#### 6. `/resources/js/pages/sales/components/PaymentsSection.tsx`
**Modifiche:** Verificare se accede a fields vendita

#### 7. `/resources/js/components/sales/cards/PaymentCard.tsx`
**Modifiche:** Verificare se accede a fields vendita

#### 8. `/resources/js/pages/sales/sales.tsx` (Lista vendite)
**Modifiche:** Verificare se mostra dettagli righe vendita

#### 9. `/resources/js/components/sales/SummaryTab.tsx`
**Modifiche:** Verificare se usa fields vendita

## 🎯 Piano Azione Rapido

### Step 1: Far funzionare subito la visualizzazione ✅
- [x] Aggiornare `sale-show.tsx` ✅
- [x] Aggiornare `SaleRowsCard.tsx` ✅
- [x] Types TypeScript ✅

### Step 2: Abilitare creazione vendite (PROSSIMO)
- [ ] Aggiungere `tax_included: true` nel submit di `sale-create.tsx`
- [ ] Testare creazione vendita
- [ ] Verificare che backend faccia scorporo corretto

### Step 3: Verificare altri componenti
- [ ] Controllare ogni file con `unit_price`/`total` non aggiornato
- [ ] Decidere se serve aggiornare o se è OK così

## 📝 Note Implementazione

### Logica Prezzi nel Flusso
```
FRONTEND (sale-create):
- Utente vede €122 (lordo con IVA 22%) se tax_included = true
- Utente vede €100 (netto) se tax_included = false
- Frontend invia: { unit_price: 122, tax_included: true }

BACKEND (SaleService):
- Riceve: unit_price = 122, tax_included = true
- Scorporo: 122 / 1.22 = 100 (netto)
- Salva in DB: unit_price_net = 10000 (centesimi NETTI)

FRONTEND (sale-show):
- Legge dal DB: unit_price_net = 10000 (netto)
- Se tax_included = true, mostra: 10000 * 1.22 = €122 (lordo)
- Se tax_included = false, mostra: 10000 = €100 (netto)
```

### Retrocompatibilità
**PROBLEMA:** Vendite create prima della migrazione hanno ancora i vecchi field names.

**SOLUZIONE:**
1. Le migrazioni hanno **rinominato** le colonne, quindi i vecchi dati sono automaticamente nei nuovi campi
2. Nessun problema di retrocompatibilità - i dati esistenti sono preservati

## 🚨 Urgenze

**Prima di poter creare nuove vendite, serve:**
1. Aggiungere `tax_included` al submit in `sale-create.tsx`
2. Verificare che il SaleService riceva correttamente il campo
3. Test completo di creazione vendita

**Tempo stimato:** 30 minuti

# Session Summary - General Tab Uniformità e Correzione Quote Associative
**Data**: 17 Gennaio 2025

## Obiettivo
Sistemare la tab generale del cliente rendendola più uniforme alle altre tab, correggendo i modal che non funzionavano e chiarendo la differenza tra "Quota Associativa" e "Tesseramento Ente Sportivo".

## Problemi Risolti

### 1. Layout Non Uniforme ✅
**Problema**: La GeneralTab usava `p: 2` e `spacing={2}` mentre le altre tab usavano `p: 3` e `spacing={3}`.

**Soluzione**:
- Modificato padding da `p: 2` → `p: 3`
- Modificato spacing da `spacing={2}` → `spacing={3}` in tutti i Grid
- Aggiunto wrapper `<Box sx={{ p: 3 }}>` coerente con SalesTab e MeasurementsTab

**File modificati**:
- `resources/js/components/customers/tabs/GeneralTab.tsx`

---

### 2. Confusione tra Quota Associativa e Tesseramento Sportivo ✅
**Problema**: Le due card sembravano fare la stessa cosa ma hanno scopi completamente diversi.

#### **MembershipFeeCard (Quota Associativa)**

**Cosa rappresenta**:
- Quota annuale pagata ALLA STRUTTURA (la palestra stessa)
- Copre: assicurazione infortuni, utenze base, "spese condominiali"
- Esempio: €30-50/anno

**Flusso Corretto** (era sbagliato prima):
1. Cliente acquista "Quota Associativa 2025" tramite una **vendita normale**
2. La vendita crea un `sale_row`
3. Il `sale_row` è collegato a `membership_fees` tramite `sale_row_id`
4. La card mostra solo lo stato (SOLA VISUALIZZAZIONE)

**Implementazione**:
- ✅ **NO creazione manuale** (viene dalle vendite)
- ✅ **NO eliminazione** (elimini la vendita, non la quota)
- ✅ Icona: 👁️ `VisibilityIcon` (non EditIcon)
- ✅ Dialog: `ViewMembershipFeeDialog` (non "Add")
  - Alert informativo: "Le quote vengono create dalle vendite"
  - Info vendita (importo, organizzazione) - READ ONLY
  - Campi editabili: solo date e status (per correzioni)
  - Se NO quota attiva: spiega come acquistarla
- ✅ Campo `membership_number`: NON usato (legacy, per futura tessera fisica)

**API Routes**:
```
GET  /api/v1/customers/{customer}/membership-fees        - Lista
GET  /api/v1/customers/{customer}/membership-fees/{fee}  - Dettaglio
PUT  /api/v1/customers/{customer}/membership-fees/{fee}  - Correzione (NO store/destroy)
```

**File creati/modificati**:
- `resources/js/components/customers/cards/MembershipFeeCard.tsx` (semplificata)
- `resources/js/components/customers/dialogs/ViewMembershipFeeDialog.tsx` (nuovo)
- `app/Http/Controllers/Application/Customers/MembershipFeeController.php` (solo index/show/update)
- `routes/tenant/api/routes.php` (rimossi store/destroy)

#### **SportsRegistrationCard (Tesseramento Ente Sportivo)**

**Cosa rappresenta**:
- Tesseramento ad ENTE SPORTIVO ESTERNO (ASI, CONI, FIF, FIPE, etc.)
- Per partecipare a gare e manifestazioni sportive
- Spesso GRATUITO
- NON collegato a vendite

**Implementazione**:
- ✅ **Gestione completa** (creazione/modifica/eliminazione manuale)
- ✅ Icona: ✏️ `EditIcon`
- ✅ Dialog: `AddSportsRegistrationDialog`
  - Select con lista predefinita enti sportivi
  - Campo `membership_number` per numero tessera dell'ente
  - NO campo amount
- ✅ SmallCard format (era Card grande prima)

**API Routes**:
```
GET    /api/v1/customers/{customer}/sports-registrations              - Lista
POST   /api/v1/customers/{customer}/sports-registrations              - Crea
GET    /api/v1/customers/{customer}/sports-registrations/{reg}        - Dettaglio
PUT    /api/v1/customers/{customer}/sports-registrations/{reg}        - Modifica
DELETE /api/v1/customers/{customer}/sports-registrations/{reg}        - Elimina
```

**File modificati**:
- `resources/js/components/customers/cards/SportsRegistrationCard.tsx` (trasformata in SmallCard)
- `resources/js/components/customers/dialogs/AddSportsRegistrationDialog.tsx` (già esistente)
- `app/Http/Controllers/Application/Customers/SportsRegistrationController.php` (full CRUD)

---

## Tabella Comparativa

| Aspetto | Quota Associativa | Tesseramento Sportivo |
|---------|-------------------|----------------------|
| **Creazione** | ✅ Automatica da vendita | ✏️ Manuale |
| **Modifica** | Solo date/status | Tutti i campi |
| **Eliminazione** | ❌ No | ✅ Sì |
| **Importo** | ✅ Sì (dalla vendita) | ❌ No (spesso gratuito) |
| **Icona bottone** | 👁️ Visualizza | ✏️ Modifica |
| **Dialog** | ViewMembershipFeeDialog | AddSportsRegistrationDialog |
| **Campo organization** | Nome struttura (dalla vendita) | Ente sportivo (select) |
| **Campo membership_number** | ❌ Non usato | ✅ Numero tessera ente |
| **Collegamento vendite** | ✅ Sempre (`sale_row_id`) | ❌ Mai |

---

## Database

### `membership_fees`
```sql
CREATE TABLE membership_fees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    sale_row_id BIGINT UNSIGNED NULL,        -- SEMPRE popolato dalla vendita
    organization VARCHAR(100) NOT NULL,       -- Nome struttura dalla vendita
    membership_number VARCHAR(50) NULL,       -- NON usato (legacy)
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,            -- Dalla vendita
    status ENUM('active', 'expired', 'suspended'),
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_row_id) REFERENCES sale_rows(id) ON DELETE SET NULL
);
```

### `sports_registrations`
```sql
CREATE TABLE sports_registrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    organization VARCHAR(100) NOT NULL,       -- ASI, CONI, FIF, etc. (select)
    membership_number VARCHAR(50) NULL,       -- Numero tessera ente
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired'),
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```

---

## File Modificati/Creati

### Frontend
- ✅ `resources/js/components/customers/tabs/GeneralTab.tsx` - Layout uniforme
- ✅ `resources/js/components/customers/cards/MembershipFeeCard.tsx` - Semplificata
- ✅ `resources/js/components/customers/cards/SportsRegistrationCard.tsx` - SmallCard
- ✅ `resources/js/components/customers/dialogs/ViewMembershipFeeDialog.tsx` - **Nuovo**
- ❌ `resources/js/components/customers/dialogs/AddMembershipFeeDialog.tsx` - **Rimosso** (sbagliato)

### Backend
- ✅ `app/Http/Controllers/Application/Customers/MembershipFeeController.php` - index/show/update
- ✅ `routes/tenant/api/routes.php` - Route semplificate

### Documentazione
- ✅ `docs/CUSTOMER_MANAGEMENT.md` - Aggiornato con differenze chiare

---

## Test da Eseguire

1. **Quota Associativa**:
   - [ ] Vendere una "Quota Associativa 2025" a un cliente
   - [ ] Verificare che appaia nella MembershipFeeCard
   - [ ] Cliccare sull'icona occhio
   - [ ] Verificare che il dialog mostri le info dalla vendita (read-only)
   - [ ] Modificare solo date/status e salvare
   - [ ] Verificare che NON sia possibile creare/eliminare manualmente

2. **Tesseramento Sportivo**:
   - [ ] Cliccare sull'icona matita
   - [ ] Creare un nuovo tesseramento ASI
   - [ ] Modificare il tesseramento
   - [ ] Eliminare il tesseramento
   - [ ] Verificare che funzioni tutto

3. **Layout**:
   - [ ] Verificare che gli spacing siano uniformi tra GeneralTab, SalesTab, MeasurementsTab

---

## Note Implementative

### Perché `membership_number` esiste ma non si usa?
Il campo esiste in `membership_fees` ma NON viene usato nel frontend perché:
1. Non ha senso per una quota associativa (quella è solo un pagamento)
2. Potrebbe servire in futuro per tessere fisiche di controllo accessi
3. Mantenerlo nel DB non costa nulla (campo nullable)

### Perché ViewMembershipFeeDialog e non EditMembershipFeeDialog?
Per chiarire l'intento: NON è un form di modifica completo, è principalmente una **visualizzazione** con possibilità di correggere errori nelle date.

---

## Conclusione

✅ **Layout uniforme** tra tutte le tab
✅ **Distinzione chiara** tra Quota Associativa (dalla vendita) e Tesseramento Sportivo (manuale)
✅ **Flusso corretto** implementato (quote create dalle vendite, non manualmente)
✅ **Documentazione aggiornata** con tabelle comparative

**Compilazione**: ✅ Frontend e backend compilano senza errori
**Pronto per test**: ✅ Sì

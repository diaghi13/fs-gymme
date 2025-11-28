# Customer Features - Recent Implementations

Questo documento descrive le funzionalità recentemente implementate per la gestione clienti nell'applicazione fs-gymme.

## Indice

1. [Note Cliente](#note-cliente)
2. [Avatar Cliente](#avatar-cliente)
3. [Sistema di Alert e Monitoraggio](#sistema-di-alert-e-monitoraggio)
4. [Gestione Sospensioni ed Estensioni Abbonamenti](#gestione-sospensioni-ed-estensioni-abbonamenti)

---

## Note Cliente

### Descrizione
Sistema per aggiungere e gestire note personalizzate per ogni cliente, con editing inline.

### Implementazione

#### Backend
- **Migration**: `database/migrations/tenant/2025_11_17_153633_add_notes_and_avatar_to_customers_table.php`
  - Campo `notes` (text, nullable)
  - Campo `avatar_url` (string, nullable)

- **Model**: `app/Models/Customer/Customer.php`
  - Aggiunti `notes` e `avatar_url` nell'array `$fillable`

- **Controller**: `app/Http/Controllers/Application/Customers/CustomerController.php`
  - Metodo `update()` gestisce l'aggiornamento delle note tramite richiesta PUT

#### Frontend
- **Component**: `resources/js/components/customers/cards/NotesCard.tsx`
  - Visualizzazione note con formattazione multi-linea (`whiteSpace: 'pre-wrap'`)
  - Modalità editing inline con pulsanti Save/Cancel
  - Empty state quando non ci sono note
  - Integrato nella `GeneralTab`, prima colonna sotto `DetailsCard`

### Utilizzo
```typescript
// Le note vengono aggiornate tramite Inertia router
router.put(route('app.customers.update', { customer: id }), { notes });
```

---

## Avatar Cliente

### Descrizione
Sistema completo per la gestione dell'avatar del cliente con placeholder SVG performante e cattura webcam con guida visiva.

### Implementazione

#### 1. Placeholder SVG Inline
- **Component**: `resources/js/components/customers/cards/DetailsCard.tsx`
- **Caratteristiche**:
  - SVG inline per zero latency (nessun flash di caricamento)
  - Design minimalista con cerchio grigio e sagoma utente
  - Rendering immediato senza richieste HTTP esterne

```typescript
const UserAvatarPlaceholder = () => (
  <svg width="100%" height="100%" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="100" fill="#e0e0e0" />
    <circle cx="100" cy="75" r="35" fill="#bdbdbd" />
    <path d="M 30 180 Q 30 130 100 130 Q 170 130 170 180" fill="#bdbdbd" />
  </svg>
);
```

#### 2. Webcam Avatar Dialog
- **Component**: `resources/js/components/customers/dialogs/WebcamAvatarDialog.tsx`
- **Caratteristiche**:
  - **Crop quadrato**: usa Canvas API, prende la dimensione minore del video
  - **Cerchio guida**: overlay circolare con bordo bianco e sfondo semitrasparente
  - **Linee guida a croce** (crosshair): linee orizzontali e verticali per centrare il viso
  - **Flip camera**: supporto per fotocamere frontali e posteriori (user/environment)
  - **Workflow**: capture → preview → retry o save
  - **Istruzioni overlay**: "Posiziona il viso al centro del cerchio"
  - **Qualità**: JPEG 90%
  - **Upload**: FormData tramite Inertia router

```typescript
// Crop quadrato
const size = Math.min(video.videoWidth, video.videoHeight);
canvas.width = size;
canvas.height = size;

// Calcola posizione crop per centrare l'immagine
const offsetX = (video.videoWidth - size) / 2;
const offsetY = (video.videoHeight - size) / 2;

// Disegna immagine croppata
context.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
```

#### 3. Backend Upload
- **Controller**: `app/Http/Controllers/Application/Customers/CustomerController.php`
  - Metodo `uploadAvatar()`
  - Validazione: `image|max:2048` (max 2MB)
  - Storage: `storage/app/public/avatars/`
  - Elimina avatar precedente se esiste
  - Aggiorna `avatar_url` nel database

- **Route**: `routes/tenant/web/customers.php`
  ```php
  Route::post('customers/{customer}/avatar', [CustomerController::class, 'uploadAvatar'])
      ->name('app.customers.avatar.upload');
  ```

### Utilizzo
```typescript
// Upload avatar da WebcamAvatarDialog
const formData = new FormData();
formData.append('avatar', blob, 'avatar.jpg');

router.post(
  route('app.customers.avatar.upload', { customer: id }),
  formData,
  { preserveScroll: true }
);
```

---

## Sistema di Alert e Monitoraggio

### Descrizione
Sistema automatico di alert per monitorare scadenze e stato del cliente, con visualizzazione tramite badge colorati.

### Caratteristiche Monitorate

1. **Abbonamenti** (Subscriptions)
   - Scaduto (critical) - rosso
   - In scadenza entro 7 giorni (warning) - giallo

2. **Quota Associativa** (Membership Fee) - **OBBLIGATORIA**
   - Mancante (critical) - rosso
   - In scadenza entro 7 giorni (warning) - giallo

3. **Certificato Medico** (Medical Certification) - **OBBLIGATORIO**
   - Mancante (critical) - rosso
   - Scaduto (critical) - rosso
   - In scadenza entro 7 giorni (warning) - giallo

4. **Pagamenti** (Payments)
   - Scaduti (critical) - rosso
   - Mostra numero pagamenti e importo totale

5. **Tesseramento Sportivo** (Sports Registration)
   - Scaduto (warning) - giallo
   - In scadenza entro 7 giorni (warning) - giallo

### Implementazione

#### Backend
- **Model**: `app/Models/Customer/Customer.php`
  - **Accessor**: `getCustomerAlertsAttribute()`
  - Soglia warning: 7 giorni
  - Calcola tutti gli alert automaticamente usando le relazioni già caricate
  - Restituisce array di alert con: `type`, `severity`, `message`, `icon`, `days`, `count`, `amount`

```php
public function getCustomerAlertsAttribute(): array
{
    $alerts = [];
    $warningThreshold = 7; // giorni

    // Check abbonamenti scaduti o in scadenza
    // Check quota associativa scaduta o in scadenza
    // Check certificato medico scaduto o in scadenza
    // Check tesseramento sportivo scaduto o in scadenza
    // Check pagamenti scaduti

    return $alerts;
}
```

- **Controller**: `app/Http/Controllers/Application/Customers/CustomerController.php`
  - Aggiunto `customer_alerts` nell'array `append` del metodo `show()`
  - Utilizza le relazioni già eager-loaded per performance ottimali (no N+1)

#### Frontend
- **Component**: `resources/js/components/customers/cards/AlertsCard.tsx`
  - Visualizzazione alert raggruppati per severità (critical → warning → info)
  - Badge colorati nel titolo che mostrano il numero di alert
  - Icone Material-UI specifiche per ogni tipo di alert
  - Empty state "Tutto in regola" quando non ci sono alert

- **Posizionamento**: `resources/js/pages/customers/customer-show.tsx`
  - AlertsCard posizionata **tra le tab headers e il contenuto delle tab**
  - **Visibile da tutte le tab** per un monitoraggio costante
  - Box con padding per distanziamento ottimale

- **Types**: `resources/js/types/index.d.ts`
  ```typescript
  export interface CustomerAlert {
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    icon: string;
    days?: number;
    count?: number;
    amount?: number;
  }

  export interface Customer {
    // ...
    customer_alerts?: CustomerAlert[];
  }
  ```

### Severità Alert

- **Critical (rosso)**: Situazioni che richiedono attenzione immediata
  - Abbonamento scaduto
  - Quota associativa scaduta
  - Certificato medico scaduto
  - Pagamenti scaduti

- **Warning (giallo)**: Situazioni che richiedono attenzione a breve
  - Scadenze imminenti (entro 7 giorni)
  - Tesseramento sportivo scaduto

- **Info (blu)**: Informazioni generali (attualmente non utilizzato)

### Personalizzazione

Per modificare la soglia di warning, cambiare il valore di `$warningThreshold` nel metodo `getCustomerAlertsAttribute()`:

```php
$warningThreshold = 14; // 14 giorni invece di 7
```

---

## Gestione Sospensioni ed Estensioni Abbonamenti

### Descrizione
Sistema completo per gestire sospensioni ed estensioni degli abbonamenti con funzionalità di modifica ed eliminazione.

### Implementazione Precedente (Enhancement)
Aggiunta la possibilità di **modificare** ed **eliminare** sospensioni ed estensioni esistenti.

#### Backend

##### Controllers
1. **CustomerSubscriptionSuspensionController** (`app/Http/Controllers/Application/Customers/CustomerSubscriptionSuspensionController.php`)
   - Metodo `update()`: modifica sospensione con ricalcolo giorni
   - Metodo `destroy()`: elimina sospensione con decremento giorni sospesi
   - Ritorna `RedirectResponse` invece di `JsonResponse` (Inertia compatibility)

2. **CustomerSubscriptionExtensionController** (`app/Http/Controllers/Application/Customers/CustomerSubscriptionExtensionController.php`)
   - Metodo `update()`: modifica estensione con ricalcolo giorni
   - Metodo `destroy()`: elimina estensione con decremento giorni estesi
   - Ritorna `RedirectResponse` invece di `JsonResponse` (Inertia compatibility)

##### Routes
- **API routes** (`routes/tenant/api/routes.php`):
  ```php
  Route::match(['put', 'patch'], 'customer-subscriptions/suspensions/{suspension}', ...)
      ->name('api.v1.customer-subscriptions.suspensions.update');

  Route::delete('customer-subscriptions/suspensions/{suspension}', ...)
      ->name('api.v1.customer-subscriptions.suspensions.destroy');

  Route::match(['put', 'patch'], 'customer-subscriptions/extensions/{extension}', ...)
      ->name('api.v1.customer-subscriptions.extensions.update');

  Route::delete('customer-subscriptions/extensions/{extension}', ...)
      ->name('api.v1.customer-subscriptions.extensions.destroy');
  ```

#### Frontend

##### Components
1. **AddSuspensionDialog** (`resources/js/components/customers/dialogs/AddSuspensionDialog.tsx`)
   - Supporto modalità edit: `suspension?: CustomerSubscriptionSuspension`
   - Reset automatico dello stato quando cambia la prop `suspension`
   - Titolo dinamico: "Modifica Sospensione" o "Sospendi Abbonamento"
   - Pulsante dinamico: "Salva Modifiche" o "Sospendi"

2. **AddExtensionDialog** (`resources/js/components/customers/dialogs/AddExtensionDialog.tsx`)
   - Supporto modalità edit: `extension?: CustomerSubscriptionExtension`
   - Reset automatico dello stato quando cambia la prop `extension`
   - Titolo dinamico: "Modifica Proroga" o "Proroga Abbonamento"
   - Pulsante dinamico: "Salva Modifiche" o "Proroga"

3. **ExtensionsTab** (`resources/js/components/customers/tabs/ExtensionsTab.tsx`)
   - Pulsanti Edit e Delete per ogni sospensione/estensione nella tabella storico
   - Conferma eliminazione con `confirm()`
   - Handler per apertura dialog in modalità edit
   - Icone Material-UI: `EditIcon` e `Delete`

##### Workflow
```typescript
// Edit flow
const handleOpenSuspensionDialog = (subscription, suspension) => {
  setSelectedSubscription(subscription);
  setSelectedSuspension(suspension); // Passa sospensione esistente
  setOpenSuspensionDialog(true);
};

// Delete flow
const handleDeleteSuspension = (suspension) => {
  if (!confirm('Sei sicuro di voler eliminare questa sospensione?')) return;
  router.delete(route('...suspensions.destroy', { suspension: suspension.id }));
};
```

### Use Case
Perfetto per casi come:
- **Infortuni**: aumentare i giorni di sospensione se l'infortunio si prolunga
- **Errori**: diminuire o eliminare giorni se inseriti erroneamente
- **Cambi di programma**: modificare le date di sospensione
- **Proroghe speciali**: aumentare o diminuire giorni di estensione

---

## Visualizzazione Date Effettive

### Descrizione
Sistema per visualizzare correttamente le date effettive degli abbonamenti considerando sospensioni ed estensioni.

### Implementazione

#### Backend
- **Model**: `app/Models/Customer/CustomerSubscription.php`
  - **Accessor**: `getEffectiveEndDateAttribute()`
  - Calcola: `end_date + suspended_days + extended_days`
  - Aggiunto nell'array `$appends` per essere sempre disponibile

```php
public function getEffectiveEndDateAttribute(): ?\Illuminate\Support\Carbon
{
    $endDate = $this->end_date ? \Illuminate\Support\Carbon::parse($this->end_date) : null;
    if (!$endDate) return null;

    $endDate->addDays($this->suspended_days ?? 0);
    $endDate->addDays($this->extended_days ?? 0);

    return $endDate;
}
```

#### Frontend
- **Component**: `resources/js/components/customers/SubscriptionItem.tsx`
  - Mostra scadenza originale
  - Mostra giorni sospesi (giallo) se presenti
  - Mostra giorni prorogati (verde) se presenti
  - Mostra scadenza effettiva in grassetto
  - Progress bar usa `effective_end_date` per calcolo percentuale

```typescript
const effectiveEnd = subscription.effective_end_date
  ? new Date(subscription.effective_end_date)
  : end;

const percentage = effectiveEnd ? Math.round(
  ((today.getTime() - start.getTime()) / (effectiveEnd.getTime() - start.getTime())) * 100
) : 0;
```

---

## Best Practices

### Performance
- Tutti gli accessor utilizzano relazioni già eager-loaded (no N+1 queries)
- SVG placeholder inline per rendering immediato
- Webcam: gestione corretta cleanup degli stream con `useCallback` e `useEffect`

### UX
- Conferme per azioni distruttive (eliminazione sospensioni/estensioni)
- Empty states informativi (note, alert)
- Badge colorati per identificazione rapida dello stato
- Messaggi di successo dopo ogni operazione

### Code Quality
- Type safety completo con TypeScript
- Interfacce ben definite in `types/index.d.ts`
- Componenti riutilizzabili e modulari
- Separation of concerns (backend/frontend)

---

## File Modificati/Creati

### Backend
```
app/
├── Http/Controllers/Application/Customers/
│   ├── CustomerController.php (uploadAvatar, append customer_alerts)
│   ├── CustomerSubscriptionSuspensionController.php (update, destroy)
│   └── CustomerSubscriptionExtensionController.php (update, destroy)
├── Models/Customer/
│   ├── Customer.php (notes, avatar_url, customer_alerts accessor)
│   └── CustomerSubscription.php (effective_end_date accessor)

database/migrations/tenant/
└── 2025_11_17_153633_add_notes_and_avatar_to_customers_table.php

routes/tenant/
├── web/customers.php (avatar upload route)
└── api/routes.php (suspensions/extensions update/destroy routes)
```

### Frontend
```
resources/js/
├── components/customers/
│   ├── cards/
│   │   ├── AlertsCard.tsx (NEW)
│   │   ├── DetailsCard.tsx (SVG placeholder, webcam integration)
│   │   └── NotesCard.tsx (NEW)
│   ├── dialogs/
│   │   ├── AddSuspensionDialog.tsx (edit mode)
│   │   ├── AddExtensionDialog.tsx (edit mode)
│   │   └── WebcamAvatarDialog.tsx (NEW)
│   ├── tabs/
│   │   ├── ExtensionsTab.tsx (edit/delete buttons)
│   │   └── GeneralTab.tsx (NotesCard, AlertsCard integration)
│   └── SubscriptionItem.tsx (effective dates display)
└── types/
    └── index.d.ts (CustomerAlert, notes, avatar_url)
```

---

## Testing

### Manuale
1. **Notes**: Verificare creazione, modifica, cancellazione note
2. **Avatar**: Testare upload da file e webcam, placeholder SVG
3. **Alerts**: Creare scenari con varie scadenze e verificare gli alert
4. **Sospensioni/Estensioni**: Testare modifica ed eliminazione, verificare ricalcolo date

### Automazione
Creare test Feature/Unit per:
- Upload avatar con validazione
- Calcolo customer_alerts con vari scenari
- Update/delete sospensioni con ricalcolo giorni
- Calcolo effective_end_date

---

## Changelog

### 2025-11-17
- ✅ Aggiunto sistema note cliente
- ✅ Implementato placeholder SVG performante per avatar
- ✅ Creato WebcamAvatarDialog con crop quadrato e guide visive
- ✅ Aggiunto sistema completo di alert e monitoraggio scadenze
  - **Quota associativa e certificato medico ora OBBLIGATORI**
  - AlertsCard visibile da tutte le tab (posizionata tra tab headers e contenuto)
- ✅ Implementata modifica/eliminazione sospensioni ed estensioni
- ✅ Aggiunta visualizzazione date effettive abbonamenti

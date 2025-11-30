# Aggiornamenti Checklist User & Roles Management

**Data**: 21 Novembre 2025
**Versione Checklist**: 2.0

## Modifiche Apportate

### 1. Aggiunto Ruolo "staff" (7° ruolo)

**Motivazione**: Necessario un ruolo generico e flessibile per utenti che non rientrano nelle categorie predefinite.

**Caratteristiche**:
- Nessuna permission di default
- Permissions assegnate manualmente dall'owner/manager
- Perfetto per ruoli "ibridi" o situazioni specifiche
- Badge colore: slate

**Totale ruoli**: 7
1. owner
2. manager
3. back_office
4. **staff** (nuovo)
5. trainer
6. receptionist
7. customer

---

### 2. Role Management → Obbligatorio (Non più opzionale)

**Motivazione**: Essenziale per gestire il ruolo "staff" e permettere customizzazioni future.

**Modifiche**:
- **Sezione 6.4**: RoleController ora obbligatorio
- **Sezione 6.5**: Aggiunto RolePermissionController (nuovo)
- **Sezione 7.3**: Routes per roles e permissions
- **Sezione 9.4**: Pagina Roles Management UI migliorata

**Funzionalità implementate**:
- Creazione ruoli custom
- Gestione permissions granulare per ogni ruolo
- UI tree view per permissions raggruppate
- Warning per modifiche a ruoli predefiniti
- Preview utenti impattati

---

### 3. Hook useAuthorization Unificato

**Motivazione**: Gestione centralizzata di permissions/roles E subscription features.

**Posizione**: Nuova sezione 8.6 (Frontend - Componenti Base)

**Funzionalità**:

#### Permissions & Roles
```typescript
can(permission: string): boolean
cannot(permission: string): boolean
hasRole(role: string): boolean
hasAnyRole(roles: string[]): boolean
hasAllRoles(roles: string[]): boolean
```

#### Subscription Features
```typescript
hasFeature(feature: string): boolean
hasAnyFeature(features: string[]): boolean
canAccessFeature(feature: string): boolean
```

#### Helpers UI
```typescript
isOwner: boolean
isManager: boolean
isStaff: boolean
canManageUsers: boolean
canManageSettings: boolean
```

**Integrazione**:
- Dati passati tramite HandleInertiaRequests middleware (Sezione 10.5)
- Memoization per performance
- TypeScript types completi

**Esempio Utilizzo**:
```typescript
const { can, hasRole, hasFeature } = useAuthorization();

// Check permission
if (can('sales.create')) {
  <CreateSaleButton />
}

// Check subscription feature
if (hasFeature('advanced_reports')) {
  <AdvancedReportsModule />
} else {
  <UpgradeBanner />
}

// Combined
if (can('sales.view_profits') && hasFeature('financial_analytics')) {
  <ProfitMarginDashboard />
}
```

---

### 4. HandleInertiaRequests Middleware

**Posizione**: Nuova sezione 10.5 (Integration Points)

**Dati Shared con Frontend**:
```php
'auth' => [
    'user' => [
        'roles' => [...],
        'permissions' => [...],
    ],
],
'tenant' => [
    'subscription_plan' => [...],
    'active_features' => [...], // per hasFeature()
],
```

**Metodi Helper**:
- `getActiveSubscriptionPlan()` - Recupera piano attivo
- `getActiveFeatures()` - Array feature slugs attive

---

## Benefici delle Modifiche

### 1. Flessibilità Massima
- Ruolo "staff" copre casi edge
- Role management permette customizzazioni
- Permissions granulari per ogni esigenza

### 2. UI Conditionals Potenti
- Un solo hook per tutto: `useAuthorization`
- Gestisce sia permissions che features subscription
- Codice frontend pulito e manutenibile

### 3. Future-Proof
- Facile aggiungere nuove features subscription
- Facile aggiungere nuove permissions
- Sistema scalabile per centinaia di tenant

### 4. Developer Experience
- TypeScript autocompletamento completo
- API consistente e intuitiva
- Esempi chiari nella documentazione

---

## Confronto Checklist

### Prima (v1.0)
- 6 ruoli predefiniti
- Role management opzionale
- Nessun hook unificato
- Permissions separate da subscription features

### Dopo (v2.0)
- 7 ruoli (+ staff generico)
- Role management obbligatorio con UI completa
- Hook useAuthorization unificato
- Gestione integrata permissions + subscription features
- HandleInertiaRequests aggiornato

---

## Impatto sulle Fasi

### Fasi Modificate
- **Fase 2**: Aggiunto ruolo "staff" nei seeders
- **Fase 6**: Reso obbligatorio RoleController + aggiunto RolePermissionController
- **Fase 7**: Aggiunte routes per role management
- **Fase 8**: Aggiunto hook useAuthorization (sezione 8.6)
- **Fase 9**: Migliorata pagina Roles Management
- **Fase 10**: Aggiunta sezione HandleInertiaRequests (10.5)

### Fasi Invariate
- Fase 1, 3, 4, 5: Nessun cambiamento
- Fasi 11-18: Nessun cambiamento significativo

### Tempo Stimato
- Prima: ~30-35 ore
- Dopo: ~35-40 ore (+5 ore per role management UI e hook)

---

## Prossimi Passi

1. ✅ Checklist aggiornata
2. ⏳ Approvazione modifiche
3. ⏳ Inizio Fase 1: Database & Migrations

**Pronto per iniziare quando sei pronto! 🚀**

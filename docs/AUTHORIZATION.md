# Sistema di Autorizzazioni Frontend

Questo documento descrive il sistema di autorizzazioni implementato nel frontend per gestire permessi, ruoli e feature del tenant.

## Panoramica

Il sistema di autorizzazioni frontend fornisce un modo scalabile e manutenibile per:
- Filtrare il menu dell'applicazione in base ai permessi dell'utente
- Nascondere/mostrare elementi UI in base a permessi, ruoli e feature
- Dare accesso completo ai tenant demo per incoraggiare l'upgrade
- Gestire feature basate sui piani di abbonamento

## Architettura

### 1. Backend: HandleInertiaRequests Middleware

Il middleware `app/Http/Middleware/HandleInertiaRequests.php` passa i dati di autorizzazione al frontend:

```php
'auth' => [
    'user' => [
        'permissions' => ['sales.view', 'customers.create', ...],
        'roles' => ['owner', 'manager', ...],
    ],
],
'tenant' => [
    'active_features' => ['advanced_reporting', 'multi_structure', ...],
    'is_demo' => true/false,
],
```

**Importante**:
- Le feature vengono recuperate dal **database centrale** usando `tenancy()->central()`
- I tenant demo ricevono **TUTTE le feature** attive per incoraggiare l'upgrade
- I tenant con abbonamento ricevono solo le feature del loro piano

### 2. AuthorizationContext

Il context `resources/js/contexts/AuthorizationContext.tsx` fornisce i dati di autorizzazione a tutta l'applicazione.

**Metodi disponibili**:

```typescript
// Controllo permessi
can(permission: string): boolean
cannot(permission: string): boolean
hasPermission(permission: string): boolean
hasAnyPermission(permissions: string[]): boolean
hasAllPermissions(permissions: string[]): boolean

// Controllo ruoli
hasRole(role: string): boolean
hasAnyRole(roles: string[]): boolean
hasAllRoles(roles: string[]): boolean

// Controllo feature
hasFeature(feature: string): boolean
hasAnyFeature(features: string[]): boolean
canAccessFeature(feature: string): boolean

// Shortcut helper
isOwner: boolean
isManager: boolean
canManageUsers: boolean
canViewFinancialData: boolean
// ... altri helper

// Dati raw
user: AuthUser
userPermissions: string[]
userRoles: string[]
activeFeatures: string[]
isDemo: boolean
```

**Utilizzo del hook**:

```typescript
import { useAuthorization } from '@/contexts/AuthorizationContext';

function MyComponent() {
  const { can, hasFeature, isOwner } = useAuthorization();

  if (can('sales.create')) {
    // Mostra pulsante crea vendita
  }

  if (hasFeature('advanced_reporting')) {
    // Mostra modulo report avanzati
  }
}
```

### 3. Menu Structure & Filtering

**Menu con metadati** (`resources/js/layouts/index.ts`):

```typescript
export interface MenuItem {
  name: string;
  href?: string;
  Icon: any;
  permission?: string | string[];  // Richiede uno o più permessi
  feature?: string | string[];      // Richiede una o più feature
  role?: string | string[];         // Richiede uno o più ruoli
  items?: MenuItem[];
}

export const menuList = (tenant: string): MenuItem[] => ([
  {
    name: 'Dashboard',
    href: route('app.dashboard', { tenant }),
    Icon: DashboardIcon,
    // Nessun permesso richiesto - visibile a tutti
  },
  {
    name: 'Contabilità',
    Icon: MonetizationOnIcon,
    permission: ['sales.view_profits', 'customers.view_financial'],
    feature: 'advanced_reporting', // Richiede feature
    items: [...]
  },
]);
```

**Hook useFilteredMenu** (`resources/js/hooks/useFilteredMenu.ts`):

Filtra automaticamente le voci di menu in base a:
1. Permessi dell'utente
2. Ruoli dell'utente
3. Feature del tenant

```typescript
import { useFilteredMenu } from '@/hooks/useFilteredMenu';

const rawMenu = menuList(tenant);
const filteredMenu = useFilteredMenu(rawMenu);
// Restituisce solo le voci accessibili all'utente
```

**Logica di filtraggio**:
- Se una voce di menu ha `permission`, l'utente deve avere almeno uno dei permessi
- Se una voce di menu ha `feature`, il tenant deve avere almeno una delle feature
- Se una voce di menu ha `role`, l'utente deve avere almeno uno dei ruoli
- Se una voce padre ha sotto-voci ma tutte vengono filtrate, anche il padre viene nascosto

### 4. Protected Component

Il componente `resources/js/components/Protected.tsx` rende condizionale il rendering degli elementi UI.

**Utilizzo base**:

```typescript
import Protected from '@/components/Protected';

// Mostra solo se l'utente ha il permesso
<Protected permission="sales.create">
  <CreateSaleButton />
</Protected>

// Mostra solo se l'utente ha QUALSIASI permesso
<Protected permission={['sales.view', 'sales.create']}>
  <SalesSection />
</Protected>

// Mostra solo se l'utente ha TUTTI i permessi
<Protected permission={['sales.view', 'sales.edit']} requireAllPermissions>
  <EditSaleForm />
</Protected>

// Mostra solo se l'utente ha il ruolo
<Protected role="owner">
  <OwnerDashboard />
</Protected>

// Mostra solo se il tenant ha la feature
<Protected feature="advanced_reporting">
  <AdvancedReportsModule />
</Protected>

// Combina permessi e feature
<Protected permission="sales.view_profits" feature="advanced_reporting">
  <ProfitAnalysis />
</Protected>

// Mostra contenuto alternativo se l'accesso è negato
<Protected
  permission="sales.view"
  fallback={<UpgradePrompt message="Aggiorna per accedere alle vendite" />}
>
  <SalesData />
</Protected>
```

**Props disponibili**:

- `permission`: string | string[] - Permesso/i richiesto/i
- `requireAllPermissions`: boolean - Se true, richiede TUTTI i permessi. Default: false (almeno uno)
- `role`: string | string[] - Ruolo/i richiesto/i
- `requireAllRoles`: boolean - Se true, richiede TUTTI i ruoli. Default: false (almeno uno)
- `feature`: string | string[] - Feature richiesta/e
- `requireAllFeatures`: boolean - Se true, richiede TUTTE le feature. Default: false (almeno una)
- `fallback`: ReactNode - Contenuto da mostrare se l'accesso è negato

## Integrazione nel Layout

Il `AuthorizationProvider` deve avvolgere l'intera applicazione in `resources/js/layouts/AppLayout.tsx`:

```typescript
import { AuthorizationProvider } from '@/contexts/AuthorizationContext';

export default function AppLayout({ children }) {
  return (
    <AuthorizationProvider>
      <OnlineUsersProvider>
        {/* resto del layout */}
      </OnlineUsersProvider>
    </AuthorizationProvider>
  );
}
```

Il Drawer usa automaticamente il menu filtrato:

```typescript
const rawMenuItems = menuList(props.currentTenantId);
const filteredMenuItems = useFilteredMenu(rawMenuItems);
```

## Tenant Demo

I tenant demo hanno un comportamento speciale per incoraggiare l'upgrade:

1. **Backend**: `HandleInertiaRequests` dà TUTTE le feature ai tenant demo
   ```php
   if ($isDemo) {
       $activeFeatures = $this->getAllFeatures();
   }
   ```

2. **Frontend**: Tutti i componenti protetti da `feature` saranno visibili
3. **Logica**: Demo tenants vedono TUTTO quello che potrebbero avere con un piano a pagamento

## Best Practices

1. **Menu**: Aggiungi sempre metadati `permission`/`feature`/`role` alle voci di menu
2. **UI Elements**: Usa `<Protected>` per nascondere pulsanti/sezioni sensibili
3. **Backend Protection**: Il frontend nasconde solo l'UI - il backend DEVE validare i permessi
4. **Consistency**: Usa gli stessi nomi di permessi/feature tra backend e frontend
5. **Performance**: `AuthorizationContext` usa `useMemo` per evitare ricalcoli non necessari

## Esempi Pratici

### Esempio 1: Pagina Vendite

```typescript
import { useAuthorization } from '@/contexts/AuthorizationContext';
import Protected from '@/components/Protected';

function SalesPage() {
  const { can } = useAuthorization();

  return (
    <Box>
      <Typography variant="h4">Vendite</Typography>

      {/* Pulsante visibile solo a chi può creare vendite */}
      <Protected permission="sales.create">
        <Button onClick={handleCreate}>Nuova Vendita</Button>
      </Protected>

      {/* Tabella vendite visibile solo a chi può visualizzarle */}
      <Protected permission="sales.view">
        <SalesTable />
      </Protected>

      {/* Profitti visibili solo con permesso e feature */}
      <Protected
        permission="sales.view_profits"
        feature="advanced_reporting"
        fallback={<UpgradeCard feature="advanced_reporting" />}
      >
        <ProfitChart />
      </Protected>
    </Box>
  );
}
```

### Esempio 2: Dashboard Owner

```typescript
function Dashboard() {
  const { isOwner, isManager, canViewFinancialData } = useAuthorization();

  return (
    <Box>
      {/* Sezione visibile solo a owner e manager */}
      <Protected role={['owner', 'manager']}>
        <ManagementSection />
      </Protected>

      {/* Dati finanziari visibili a chi ha il permesso */}
      {canViewFinancialData && <FinancialOverview />}

      {/* Widget avanzati solo con feature */}
      <Protected feature="advanced_reporting">
        <AdvancedWidgets />
      </Protected>
    </Box>
  );
}
```

### Esempio 3: Menu Personalizzato

```typescript
// layouts/index.ts
export const menuList = (tenant: string): MenuItem[] => ([
  {
    name: 'Dashboard',
    href: route('app.dashboard', { tenant }),
    Icon: DashboardIcon,
    // Visibile a tutti
  },
  {
    name: 'Clienti',
    Icon: PeopleIcon,
    permission: 'customers.view',
    items: [
      {
        name: 'Aggiungi',
        href: route('app.customers.create', { tenant }),
        permission: 'customers.create',
      },
      {
        name: 'Tutti',
        href: route('app.customers.index', { tenant }),
        permission: 'customers.view',
      },
    ],
  },
  {
    name: 'Contabilità',
    Icon: MonetizationOnIcon,
    permission: ['sales.view_profits', 'customers.view_financial'],
    feature: 'advanced_reporting', // Solo con feature
    items: [
      {
        name: 'Prima Nota',
        href: '/accounting/journal-entries',
        permission: 'sales.view_profits',
      },
    ],
  },
]);
```

## Risoluzione Problemi

### Menu non filtrato
- Verifica che `AuthorizationProvider` avvolga l'app
- Controlla che il Drawer usi `useFilteredMenu`
- Verifica i metadati delle voci di menu

### Feature non funzionanti
- Controlla che `HandleInertiaRequests` usi `tenancy()->central()`
- Verifica che le feature siano attive nel database centrale
- Controlla che i nomi delle feature corrispondano tra backend e frontend

### Permessi non riconosciuti
- Verifica che l'utente abbia i permessi nel database tenant
- Controlla che i nomi dei permessi siano corretti (es: `customers.view`, non `view-customers`)
- Usa gli strumenti di debug: `console.log(authorization.userPermissions)`

## File Correlati

- `app/Http/Middleware/HandleInertiaRequests.php` - Backend data sharing
- `resources/js/contexts/AuthorizationContext.tsx` - Authorization context
- `resources/js/hooks/useFilteredMenu.ts` - Menu filtering hook
- `resources/js/components/Protected.tsx` - Protected component
- `resources/js/layouts/index.ts` - Menu structure
- `resources/js/layouts/AppLayout.tsx` - App layout with provider
- `resources/js/components/layout/Drawer.tsx` - Drawer with filtered menu
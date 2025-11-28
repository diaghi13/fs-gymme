# Piano Gestione Utenti e Roles Multi-Tenant

**Data**: 21 Novembre 2025
**Status**: In Pianificazione

## Architettura Esistente

### Database Centrale (fs-gymme)

**users table**
- `id`: bigint (PK)
- `global_id`: varchar (unique) - identificatore globale
- `email`: varchar (unique)
- `first_name`, `last_name`, `password`
- Altri campi utente

**tenant_users pivot**
- `tenant_id`: varchar (FK → tenants.id)
- `global_user_id`: varchar (FK → users.global_id)
- Unique: (tenant_id, global_user_id)

**roles table** (Spatie Permission)
- `id`: bigint (PK)
- `name`: varchar
- `guard_name`: varchar
- Unique: (name, guard_name)

**model_has_roles pivot** (Spatie Permission)
- `role_id`: bigint (FK → roles.id)
- `model_type`: varchar
- `model_id`: bigint
- PK: (role_id, model_id, model_type)

### Database Tenant (gymme-tenant_xxx)

**users table** (sincronizzata da centrale)
- Stessi campi del database centrale
- Sincronizzazione automatica via `ResourceSyncing`

### Models

**CentralUser.php** (database centrale)
- Usa `HasRoles` di Spatie Permission ✅
- Relazione `tenants()` → BelongsToMany
- Implementa `SyncMaster` per sincronizzazione

**User.php** (database tenant)
- `HasRoles` **COMMENTATO** per problemi di serializzazione ❌
- Implementa `Syncable`
- Relazione `customer()` → HasOne

## Problema Attuale

1. **Roles solo nel database centrale**: HasRoles funziona solo su CentralUser
2. **Memory exhaustion**: HasRoles causa problemi di serializzazione nel contesto tenant
3. **Nessun tenant-scoping**: Un utente ha gli stessi ruoli in tutti i tenant
4. **Nessuna UI**: Non c'è interfaccia per gestire utenti e assegnare ruoli

## Requisiti

### Funzionali
1. Un utente può avere **diversi ruoli in diversi tenant**
2. I ruoli devono essere **tenant-specific** (ogni tenant definisce i propri ruoli)
3. Un **admin di un tenant** non può modificare utenti di altri tenant
4. Supporto per ruoli predefiniti: Owner, Admin, Manager, Staff, Readonly

### Tecnici
1. Risolvere il problema di serializzazione con HasRoles
2. Mantenere la sincronizzazione utenti tra centrale e tenant
3. Performance accettabili (no memory exhaustion)
4. Facile da estendere per future personalizzazioni

## Approcci Possibili

### Opzione 1: Roles nel Database Tenant (CONSIGLIATO)

**Architettura**:
- Le tabelle `roles`, `permissions`, `model_has_roles`, `role_has_permissions` vengono create in ogni database tenant
- Ogni tenant ha le proprie roles e permissions completamente isolate
- Il modello `User` (tenant) può usare `HasRoles` senza problemi
- Seeding automatico di ruoli predefiniti per ogni nuovo tenant

**Vantaggi**:
- ✅ Isolamento completo tra tenant (sicurezza)
- ✅ Ogni tenant può personalizzare i propri ruoli
- ✅ Nessun problema di serializzazione
- ✅ Semplice da implementare (Spatie funziona out-of-the-box)
- ✅ Performance ottimali (query solo nel database tenant corrente)

**Svantaggi**:
- ❌ Duplicazione tabelle (minimo impatto, ~4 tabelle per tenant)
- ❌ Non c'è visione globale dei ruoli di un utente (accettabile)

**Implementazione**:
1. Migration per creare tabelle Spatie in tenant database
2. Seeder per ruoli predefiniti
3. Riabilitare `HasRoles` nel modello User (tenant)
4. Creare UI per gestione utenti e assegnazione ruoli

### Opzione 2: Tenant-Scoped Roles nel Centrale

**Architettura**:
- Aggiungere `tenant_id` alla tabella `roles` nel database centrale
- Modificare il guard_name per includere il tenant: `web-{tenant_id}`
- Le roles sono nel database centrale ma tenant-scoped

**Vantaggi**:
- ✅ Visione centralizzata di tutti i ruoli
- ✅ Un solo set di tabelle Spatie

**Svantaggi**:
- ❌ Più complesso da implementare
- ❌ Richiede customizzazioni a Spatie Permission
- ❌ Problemi di serializzazione potrebbero persistere
- ❌ Performance peggiori (query cross-database)
- ❌ Violazione dell'isolamento tenant

### Opzione 3: Pivot Table Estesa

**Architettura**:
- Estendere `tenant_users` con `role_id`
- Le roles sono globali ma l'assegnazione è per tenant

**Vantaggi**:
- ✅ Semplice da capire

**Svantaggi**:
- ❌ Non usa Spatie Permission (reinventare la ruota)
- ❌ Nessun supporto per permissions granulari
- ❌ Difficile da estendere

## Raccomandazione: Opzione 1

L'Opzione 1 (Roles nel Database Tenant) è la soluzione migliore perché:
1. Rispetta l'architettura multi-tenant con isolamento completo
2. È l'approccio standard per app multi-tenant Laravel
3. Non richiede customizzazioni a Spatie Permission
4. Risolve automaticamente il problema di serializzazione
5. Offre la massima flessibilità per ogni tenant

## Piano di Implementazione

### Fase 1: Backend - Database e Models

#### 1.1 Migrations
```bash
php artisan make:migration create_permission_tables_in_tenant --tenant
```

Copiare le migrations di Spatie nel contesto tenant:
- `roles`
- `permissions`
- `model_has_roles`
- `model_has_permissions`
- `role_has_permissions`

#### 1.2 Seeder per Ruoli Predefiniti
```php
// database/seeders/TenantRoleSeeder.php
Role::create(['name' => 'owner', 'guard_name' => 'web']);
Role::create(['name' => 'admin', 'guard_name' => 'web']);
Role::create(['name' => 'manager', 'guard_name' => 'web']);
Role::create(['name' => 'staff', 'guard_name' => 'web']);
Role::create(['name' => 'readonly', 'guard_name' => 'web']);
```

#### 1.3 Riabilitare HasRoles in User
```php
// app/Models/User.php
use HasFactory, Notifiable, ResourceSyncing, HasRoles;
```

#### 1.4 Permissions Predefinite (opzionale)
Definire permissions per ogni area:
- Sales: `sales.view`, `sales.create`, `sales.edit`, `sales.delete`
- Customers: `customers.view`, `customers.create`, `customers.edit`, `customers.delete`
- Settings: `settings.view`, `settings.edit`
- Users: `users.view`, `users.invite`, `users.edit`, `users.delete`

### Fase 2: Backend - Controllers e API

#### 2.1 UserController
```php
// app/Http/Controllers/Application/Users/UserController.php
- index(): lista utenti del tenant corrente
- show($userId): dettagli utente con ruoli
- store(): invita nuovo utente al tenant
- update($userId): aggiorna dati utente
- destroy($userId): rimuove utente dal tenant
```

#### 2.2 UserRoleController
```php
// app/Http/Controllers/Application/Users/UserRoleController.php
- syncRoles($userId): assegna/rimuovi ruoli per un utente
```

#### 2.3 RoleController (opzionale, per admin)
```php
// app/Http/Controllers/Application/Roles/RoleController.php
- index(): lista ruoli del tenant
- store(): crea nuovo ruolo custom
- update($roleId): modifica ruolo
- destroy($roleId): elimina ruolo custom
```

### Fase 3: Frontend - Interfaccia Utente

#### 3.1 Pagina Lista Utenti
`resources/js/pages/users/user-index.tsx`
- Tabella con: Nome, Email, Ruoli, Ultimo accesso, Azioni
- Pulsante "Invita Utente"
- Filtri per ruolo
- Badge colorati per ruoli

#### 3.2 Dialog Invita Utente
`resources/js/components/users/InviteUserDialog.tsx`
- Form con: Email, First Name, Last Name
- Selezione ruoli (multi-select)
- Invia invito via email (opzionale)

#### 3.3 Dialog Modifica Utente
`resources/js/components/users/EditUserDialog.tsx`
- Form per modificare: First Name, Last Name, Phone
- Gestione ruoli (add/remove)
- Toggle is_active

#### 3.4 Pagina Gestione Ruoli (opzionale)
`resources/js/pages/roles/role-index.tsx`
- Lista ruoli con count utenti
- Gestione permissions per ruolo
- Creazione ruoli custom

### Fase 4: Middleware e Guards

#### 4.1 Middleware per Role Checking
```php
// app/Http/Middleware/EnsureUserHasRole.php
Route::middleware(['role:admin'])->group(function () {
    Route::resource('users', UserController::class);
});
```

#### 4.2 Gate Definitions (opzionale)
```php
// app/Providers/AuthServiceProvider.php
Gate::define('manage-users', fn ($user) =>
    $user->hasAnyRole(['owner', 'admin'])
);
```

### Fase 5: Testing

#### 5.1 Feature Tests
- UserManagementTest: CRUD operations
- RoleAssignmentTest: assegnazione e verifica ruoli
- TenantIsolationTest: utente tenant A non vede tenant B

#### 5.2 Unit Tests
- RoleSeederTest: verifica ruoli predefiniti
- PermissionsTest: verifica permissions corrette

## Ruoli Predefiniti

### Owner
- **Descrizione**: Proprietario del tenant, accesso completo
- **Permissions**: Tutte
- **Note**: Assegnato automaticamente al primo utente che crea il tenant

### Admin
- **Descrizione**: Amministratore con accesso completo tranne eliminazione tenant
- **Permissions**: Quasi tutte (escluso delete tenant)

### Manager
- **Descrizione**: Manager con accesso a vendite, clienti, prodotti
- **Permissions**: sales.*, customers.*, products.*, reports.view

### Staff
- **Descrizione**: Operatore con accesso limitato
- **Permissions**: sales.view, sales.create, customers.view

### Readonly
- **Descrizione**: Solo lettura, per revisori o consulenti
- **Permissions**: *.view

## Sicurezza

### Considerazioni
1. **Tenant Isolation**: Verificare sempre che le query siano scoped al tenant corrente
2. **Owner Protection**: L'owner non può essere rimosso dal tenant
3. **Self-Edit**: Un utente può modificare i propri dati ma non i propri ruoli
4. **Audit Log**: Registrare tutte le modifiche a utenti e ruoli

### Validazioni
- Solo owner/admin possono gestire utenti
- Non si può auto-assegnare il ruolo owner
- Almeno un owner deve rimanere nel tenant

## Migration Path

### Per Tenant Esistenti
1. Eseguire migration per creare tabelle roles
2. Eseguire seeder per ruoli predefiniti
3. Assegnare ruolo "owner" agli utenti esistenti (o primo utente)
4. Gli altri utenti diventano "staff" di default

### Per Nuovi Tenant
1. Seeding automatico dei ruoli durante creazione tenant
2. Primo utente diventa automaticamente "owner"

## Prossimi Passi

1. ✅ Analisi architettura esistente
2. ⏳ Approvazione approccio con cliente
3. ⏳ Implementazione Fase 1: Database e Models
4. ⏳ Implementazione Fase 2: Controllers
5. ⏳ Implementazione Fase 3: Frontend
6. ⏳ Testing completo
7. ⏳ Migration tenant esistenti
8. ⏳ Documentazione finale

## Domande Aperte

1. Serve email di invito o gli utenti vengono creati direttamente?
2. I ruoli custom sono necessari subito o possiamo iniziare con ruoli predefiniti?
3. Serve una pagina di gestione permissions granulari o bastano i ruoli?
4. Come gestire la registrazione: un utente si registra e poi viene aggiunto a tenant, o viene invitato prima?

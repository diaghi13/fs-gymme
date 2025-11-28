# Checklist Implementazione User & Roles Management

**Data Inizio**: 21 Novembre 2025
**Obiettivo**: Sistema completo di gestione utenti e ruoli multi-tenant con permissions granulari

---

## FASE 1: Database & Migrations ✅

### 1.1 Tabelle Spatie Permission nel Tenant Database
- [x] ~~Creare migration `create_permission_tables` per database tenant~~ (già esistenti)
  - [x] Tabella `roles` (id, name, guard_name, timestamps)
  - [x] Tabella `permissions` (id, name, guard_name, timestamps)
  - [x] Tabella `model_has_roles` (role_id, model_type, model_id)
  - [x] Tabella `model_has_permissions` (permission_id, model_type, model_id)
  - [x] Tabella `role_has_permissions` (permission_id, role_id)
- [x] Verificare indici e foreign keys corretti
- [x] Testare migration su database di sviluppo

### 1.2 Tabella Customer-Trainer Assignment
- [x] Creare migration `create_customer_trainer_table`
  - [x] customer_id (FK → customers.id)
  - [x] trainer_id (FK → users.id)
  - [x] assigned_at (timestamp)
  - [x] is_active (boolean, default true)
  - [x] notes (text, nullable)
  - [x] timestamps
- [x] Unique constraint (customer_id, trainer_id)
- [x] Indici per performance

### 1.3 Aggiornamento Tabella Customers
- [x] Verificare presenza campo `user_id` nullable (FK → users.id) ✅ Già presente

---

## FASE 2: Seeders ✅

### 2.1 Seeder Ruoli Predefiniti
- [x] Creare `TenantRoleSeeder.php`
  - [x] Role: owner
  - [x] Role: manager
  - [x] Role: back_office
  - [x] Role: staff (generico, permissions assegnate manualmente)
  - [x] Role: trainer
  - [x] Role: receptionist
  - [x] Role: customer
- [x] Guard name: 'web' per tutti

### 2.2 Seeder Permissions
- [x] Creare `TenantPermissionSeeder.php` (30 permissions totali)
  - [x] **Sales**: view, create, edit, delete, view_profits
  - [x] **Customers**: view_all, view_assigned, create, edit, delete, view_financial
  - [x] **Products**: view, manage
  - [x] **Pricelists**: view, manage
  - [x] **Reports**: view_financial, view_operational, export
  - [x] **Settings**: view, manage_general, manage_billing, manage_fiscal
  - [x] **Users**: view, invite, manage, delete
  - [x] **Training**: view_all, view_assigned, manage
  - [x] **Checkin**: perform

### 2.3 Seeder Role-Permissions Assignment
- [x] Creare `TenantRolePermissionSeeder.php`
- [x] Assegnare permissions ai ruoli secondo matrice definita
- [x] Owner: 30 permissions (tutte)
- [x] Manager: 29 permissions (escluso manage_fiscal)
- [x] Back Office: 13 permissions (sales.*, customers.*, reports.view_financial, settings fiscal/billing)
- [x] Staff: 0 permissions di default (assegnate manualmente dall'owner/manager)
- [x] Trainer: 4 permissions (customers.view_assigned, training.view_assigned, training.manage, checkin.perform)
- [x] Receptionist: 3 permissions (customers.view_all, checkin.perform, reports.view_operational)
- [x] Customer: 0 permissions (mobile app only)

### 2.4 Auto-Seeding per Nuovi Tenant
- [x] Aggiornare `TenantSeeder` per chiamare automaticamente:
  - [x] TenantRoleSeeder (primo, all'inizio)
  - [x] TenantPermissionSeeder
  - [x] TenantRolePermissionSeeder

---

## FASE 3: Models & Relations ✅

### 3.1 User Model (Tenant)
- [x] Riabilitare `HasRoles` trait
  ```php
  use HasFactory, HasRoles, Notifiable, ResourceSyncing;
  ```
- [x] Verificare guard_name = 'web'
- [x] Aggiungere relazione `assigned_customers()`
  ```php
  public function assigned_customers() {
      return $this->belongsToMany(Customer::class, 'customer_trainer', 'trainer_id', 'customer_id')
          ->withPivot(['assigned_at', 'is_active', 'notes'])
          ->withTimestamps()
          ->wherePivot('is_active', true);
  }
  ```
- [x] Aggiungere scope `isTrainer()`
- [x] Aggiungere helper methods: `isTrainer()`, `isOwner()`, `isManager()`, `canManageUsers()`, `canManageSettings()`

### 3.2 Customer Model
- [x] Aggiungere relazione `trainers()`
  ```php
  public function trainers() {
      return $this->belongsToMany(User::class, 'customer_trainer', 'customer_id', 'trainer_id')
          ->withPivot(['assigned_at', 'is_active', 'notes'])
          ->withTimestamps()
          ->wherePivot('is_active', true);
  }
  ```
- [x] Verificare relazione `user()` esistente ✅

### 3.3 CentralUser Model (Database Centrale)
- [x] Verificare che HasRoles sia presente (per super admin) ✅
- [x] Mantenere separato dal sistema tenant ✅

---

## FASE 4: Services ✅

### 4.1 UserService
- [x] Creare `app/Services/User/UserService.php`
  - [x] `inviteUser($data, $roleName)` - Crea/invita utente (central + tenant sync)
  - [x] `updateUser($user, $data)` - Aggiorna dati utente (sync central)
  - [x] `assignRole($user, $roleName)` - Assegna ruolo
  - [x] `assignPermissions($user, $permissions)` - Assegna permissions custom
  - [x] `removeUserFromTenant($user)` - Rimuove utente dal tenant
  - [x] `getUsersByRole($roleName)` - Filtra per ruolo
  - [x] `getTrainers()` - Lista trainer
  - [x] `canAssignRole($actor, $roleName)` - Verifica permessi assegnazione ruolo

### 4.2 CustomerUserService
- [x] Creare `app/Services/Customer/CustomerUserService.php`
  - [x] `createOrAssociateUserForCustomer($customer, $email, $password)` - Crea account per cliente (mobile app)
  - [x] `unlinkUserFromCustomer($customer)` - Scollega user
  - [x] `hasUserAccount($customer)` - Verifica account
  - [x] `getUserAccount($customer)` - Ottiene account

### 4.3 TrainerAssignmentService
- [x] Creare `app/Services/User/TrainerAssignmentService.php`
  - [x] `assignTrainer($customer, $trainer, $notes)` - Assegna trainer
  - [x] `removeTrainer($customer, $trainer)` - Rimuove (soft delete)
  - [x] `getAssignedCustomers($trainer)` - Lista clienti
  - [x] `getAssignedTrainers($customer)` - Lista trainer
  - [x] `isTrainerAssignedToCustomer($trainer, $customer)` - Verifica
  - [x] `updateAssignmentNotes($customer, $trainer, $notes)` - Aggiorna note
  - [x] `getAssignmentDetails($customer, $trainer)` - Dettagli

---

## FASE 5: Policies & Authorization ✅

### 5.1 Middleware
- [x] Middleware Spatie già configurati in `bootstrap/app.php`:
  - [x] `role:owner,manager` - Verifica ruolo
  - [x] `permission:sales.create` - Verifica permission

### 5.2 Policies
- [x] Creare `UserPolicy`
  - [x] `viewAny()` - users.view permission
  - [x] `view()` - users.view o self
  - [x] `create()` - users.invite permission
  - [x] `update()` - Non modificare owner se non sei owner
  - [x] `delete()` - Non eliminare self o owner, richiede users.delete
  - [x] `assignRole()` - Owner può tutto, Manager non può assegnare owner
  - [x] `managePermissions()` - Solo Owner/Manager

- [x] Creare `CustomerPolicy`
  - [x] `viewAny()` - customers.view_all O customers.view_assigned
  - [x] `view()` - View all, trainer vede assegnati, customer vede self
  - [x] `create()` - customers.create
  - [x] `update()` - customers.edit O trainer per assegnati
  - [x] `delete()` - customers.delete
  - [x] `viewFinancial()` - customers.view_financial
  - [x] `assignTrainer()` - training.manage O customers.edit

- [x] Creare `SalePolicy`
  - [x] `viewAny()` / `view()` - sales.view
  - [x] `create()` - sales.create
  - [x] `update()` - Non se FE inviata, richiede sales.edit
  - [x] `delete()` - Non se FE inviata/accettata, richiede sales.delete
  - [x] `viewProfits()` - sales.view_profits
  - [x] `createCreditNote()` - Validazioni + sales.create

- [x] Registrare policies in `AppServiceProvider` con Gate::policy()

### 5.3 Super Admin Access
- [x] Gate::before() aggiornato per super admin (davidedonghi00@gmail.com)
- [x] Owner bypass completo nel tenant
- [x] CentralUser super-admin bypass

---

## FASE 6: Controllers ✅

### 6.1 UserController
- [x] Creare `app/Http/Controllers/Application/Users/UserController.php`
  - [x] `index()` - Lista utenti con ruoli
  - [x] `create()` - Form invito utente
  - [x] `store()` - Salva nuovo utente con validazione role
  - [x] `show($id)` - Dettagli utente completi
  - [x] `edit($id)` - Form modifica
  - [x] `update($id)` - Aggiorna utente
  - [x] `destroy($id)` - Rimuove da tenant
- [x] Authorization via policies
- [x] Validazione inline

### 6.2 UserRoleController
- [x] Creare `app/Http/Controllers/Application/Users/UserRoleController.php`
  - [x] `update($userId)` - Cambia ruolo con validazione permissions

### 6.3 TrainerAssignmentController
- [x] Creare `app/Http/Controllers/Application/Customers/TrainerAssignmentController.php`
  - [x] `store()` - Assegna trainer a cliente
  - [x] `update()` - Aggiorna note assegnazione
  - [x] `destroy()` - Rimuove assegnazione
- [x] Authorization via CustomerPolicy->assignTrainer

### 6.4 RoleController
- [x] Creare `app/Http/Controllers/Application/Roles/RoleController.php`
  - [x] `index()` - Lista ruoli con conteggi
  - [x] `create()` - Form nuovo ruolo custom
  - [x] `store()` - Salva ruolo con permissions
  - [x] `show($id)` - Dettagli ruolo con users
  - [x] `edit($id)` - Form modifica (protezione ruoli sistema)
  - [x] `update($id)` - Aggiorna permissions
  - [x] `destroy($id)` - Elimina (validazioni: non sistema, no users)
- [x] Permissions raggruppate per categoria
- [x] Protezione ruoli predefiniti

### 6.5 RolePermissionController
- [x] ~~Creare RolePermissionController separato~~ (integrato in RoleController->update)

---

## FASE 7: Routes ✅

### 7.1 Users Routes
- [x] Creare `routes/tenant/web/users.php`:
  ```php
  Route::resource('users', UserController::class);
  Route::put('users/{user}/role', [UserRoleController::class, 'update'])
      ->name('app.users.role.update');
  });
  ```

### 7.2 Trainer Assignment Routes
- [x] Aggiungere in `routes/tenant/web/customers.php`:
  ```php
  Route::post('customers/{customer}/trainers', [TrainerAssignmentController::class, 'store'])
      ->name('app.customers.trainers.store');
  Route::put('customers/{customer}/trainers/{trainer}', [TrainerAssignmentController::class, 'update'])
      ->name('app.customers.trainers.update');
  Route::delete('customers/{customer}/trainers/{trainer}', [TrainerAssignmentController::class, 'destroy'])
      ->name('app.customers.trainers.destroy');
  ```

### 7.3 Roles Routes
- [x] Aggiungere `routes/tenant/web/users.php`:
  ```php
  Route::resource('roles', RoleController::class)
      ->names([
          'index' => 'app.roles.index',
          'create' => 'app.roles.create',
          'store' => 'app.roles.store',
          'show' => 'app.roles.show',
          'edit' => 'app.roles.edit',
          'update' => 'app.roles.update',
          'destroy' => 'app.roles.destroy',
      ]);
  ```
- [x] Include file in `routes/tenant/web/routes.php`
- [x] Routes testate e funzionanti

---

## FASE 8: Frontend - Componenti Base ⏳ (PROSSIMA FASE)

### 8.1 Tabella Utenti
- [ ] Creare `resources/js/pages/users/user-index.tsx`
  - [ ] DataGrid con colonne: Nome, Email, Ruoli, Ultimo accesso, Stato, Azioni
  - [ ] Filtro per ruolo
  - [ ] Pulsante "Invita Utente"
  - [ ] Badge colorati per ruoli
  - [ ] Icone azioni: Visualizza, Modifica, Elimina

### 8.2 Dialog Invita/Crea Utente
- [ ] Creare `resources/js/components/users/CreateUserDialog.tsx`
  - [ ] Form Formik con campi: email, first_name, last_name, phone
  - [ ] Multi-select per ruoli
  - [ ] Toggle is_active
  - [ ] Validazione frontend
  - [ ] Submit tramite Inertia

### 8.3 Dialog Modifica Utente
- [ ] Creare `resources/js/components/users/EditUserDialog.tsx`
  - [ ] Form per modifica dati personali
  - [ ] Non permette modifica email (readonly)
  - [ ] Submit tramite Inertia

### 8.4 Dialog Gestione Ruoli
- [ ] Creare `resources/js/components/users/ManageRolesDialog.tsx`
  - [ ] Lista ruoli disponibili con checkbox
  - [ ] Mostra ruoli correnti
  - [ ] Validazioni:
    - Owner non può rimuovere se stesso come owner
    - Manager/back_office non possono assegnare owner
  - [ ] Submit tramite Inertia

### 8.5 Badge Componente Ruoli
- [ ] Creare `resources/js/components/users/RoleBadge.tsx`
  - [ ] Badge colorati per ogni ruolo:
    - owner: purple
    - manager: blue
    - back_office: cyan
    - staff: slate
    - trainer: green
    - receptionist: orange
    - customer: gray

### 8.6 Hook useAuthorization (Unificato)
- [ ] Creare `resources/js/hooks/useAuthorization.ts`
  - [ ] **Funzioni per Permissions/Roles**:
    ```typescript
    can(permission: string): boolean
    cannot(permission: string): boolean
    hasRole(role: string): boolean
    hasAnyRole(roles: string[]): boolean
    hasAllRoles(roles: string[]): boolean
    ```
  - [ ] **Funzioni per Subscription Features**:
    ```typescript
    hasFeature(feature: string): boolean
    hasAnyFeature(features: string[]): boolean
    canAccessFeature(feature: string): boolean // alias
    ```
  - [ ] **Dati Utente & Tenant**:
    ```typescript
    user: User | null
    roles: string[]
    permissions: string[]
    subscriptionPlan: SubscriptionPlan | null
    activeFeatures: string[]
    ```
  - [ ] **Helpers UI**:
    ```typescript
    isOwner: boolean
    isManager: boolean
    isStaff: boolean
    canManageUsers: boolean // shortcut can('users.manage')
    canManageSettings: boolean
    ```
- [ ] Integrare con dati Inertia shared (passati da HandleInertiaRequests middleware)
- [ ] Memoization per performance
- [ ] TypeScript types per autocompletamento

**Esempio Utilizzo**:
```typescript
const { can, hasRole, hasFeature, isOwner } = useAuthorization();

// Permission check
if (can('sales.create')) {
  <Button>Crea Vendita</Button>
}

// Role check
if (hasRole('trainer')) {
  <TrainerDashboard />
}

// Subscription feature check
if (hasFeature('advanced_reports')) {
  <AdvancedReportsButton />
} else {
  <UpgradePrompt feature="advanced_reports" />
}

// Combined check
if (can('sales.view_profits') && hasFeature('financial_analytics')) {
  <ProfitMarginChart />
}
```

---

## FASE 9: Frontend - Pagine Complete ⏳

### 9.1 Pagina User Index
- [ ] Layout con AppLayout
- [ ] Header con titolo e pulsante "Invita Utente"
- [ ] Stats cards: Totale utenti, Per ruolo
- [ ] Filtri: Cerca, Ruolo, Stato
- [ ] DataGrid integrato con backend pagination
- [ ] Click su riga → vai a dettaglio

### 9.2 Pagina User Show
- [ ] Creare `resources/js/pages/users/user-show.tsx`
  - [ ] Header con nome utente e badge ruoli
  - [ ] Card info personali: email, phone, data creazione
  - [ ] Card ruoli assegnati
  - [ ] Card attività recente (log, opzionale)
  - [ ] Se trainer: lista clienti assegnati
  - [ ] Pulsanti: Modifica, Gestisci Ruoli, Disattiva

### 9.3 Integrazione in Customer Show
- [ ] Aggiungere sezione "Trainer Assegnati" in customer-show.tsx
  - [ ] Lista trainer con avatar e nome
  - [ ] Pulsante "Aggiungi Trainer"
  - [ ] Dialog per selezionare trainer da lista
  - [ ] Pulsante rimuovi per ogni trainer

### 9.4 Pagina Roles Management
- [ ] Creare `resources/js/pages/roles/role-index.tsx`
  - [ ] Tabella ruoli con: Nome, Descrizione, Utenti assegnati, Tipo (predefinito/custom)
  - [ ] Pulsante "Crea Ruolo Custom"
  - [ ] Click su riga → gestione permissions
  - [ ] Badge per distinguere ruoli predefiniti vs custom
- [ ] Creare `resources/js/pages/roles/role-permissions.tsx`
  - [ ] Tree view permissions raggruppate per area funzionale
  - [ ] Toggle per ogni permission con descrizione tooltip
  - [ ] Salvataggio bulk
  - [ ] Warning se si rimuovono permissions critiche da ruoli predefiniti
  - [ ] Preview utenti impattati

---

## FASE 10: Integration Points ⏳

### 10.1 Customer Creation Flow
- [ ] Aggiornare `CustomerController@store`
  - [ ] Se checkbox "Crea account" è selezionata:
    - [ ] Generare password random o email invitation
    - [ ] Creare User con role "customer"
    - [ ] Associare `customer.user_id = user.id`
    - [ ] Inviare email di benvenuto (opzionale)

### 10.2 Sales Controller
- [ ] Verificare autorizzazioni nei metodi:
  - [ ] `index()` - Tutti tranne receptionist e customer
  - [ ] `create()` - Permission: sales.create
  - [ ] `show()` - Permission: sales.view, nascondere profitti se non ha sales.view_profits

### 10.3 Customer Controller
- [ ] Aggiornare `index()` per applicare scope trainer:
  ```php
  $query = Customer::query();
  if (auth()->user()->hasRole('trainer')) {
      $query->whereHas('trainers', fn($q) => $q->where('trainer_id', auth()->id()));
  }
  ```
- [ ] Aggiornare `show()` per verificare autorizzazione
- [ ] Nascondere tab "Vendite" se trainer e no permission

### 10.4 Settings Controllers
- [ ] Aggiungere middleware ai vari settings controllers:
  - [ ] `InvoiceConfigurationController` - permission:settings.manage_fiscal
  - [ ] `CompanyConfigurationController` - permission:settings.manage_general
  - [ ] `VatSettingsController` - permission:settings.manage_fiscal

### 10.5 HandleInertiaRequests Middleware
- [ ] Aggiornare `app/Http/Middleware/HandleInertiaRequests.php`
- [ ] Aggiungere al metodo `share()`:
  ```php
  public function share(Request $request): array
  {
      return [
          ...parent::share($request),
          'auth' => [
              'user' => $request->user() ? [
                  'id' => $request->user()->id,
                  'email' => $request->user()->email,
                  'first_name' => $request->user()->first_name,
                  'last_name' => $request->user()->last_name,
                  'roles' => $request->user()->roles->pluck('name')->toArray(),
                  'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
              ] : null,
          ],
          'tenant' => [
              'id' => tenant('id'),
              'name' => tenant('name'),
              'subscription_plan' => $this->getActiveSubscriptionPlan(),
              'active_features' => $this->getActiveFeatures(),
          ],
      ];
  }

  private function getActiveSubscriptionPlan(): ?array
  {
      $tenant = \App\Models\Tenant::find(tenant('id'));
      $plan = $tenant?->active_subscription_plan;

      return $plan ? [
          'id' => $plan->id,
          'name' => $plan->name,
          'slug' => $plan->slug,
      ] : null;
  }

  private function getActiveFeatures(): array
  {
      $tenant = \App\Models\Tenant::find(tenant('id'));
      $plan = $tenant?->active_subscription_plan;

      // Ritorna array di feature slugs attive
      return $plan?->features->pluck('slug')->toArray() ?? [];
  }
  ```
- [ ] Ottimizzare con cache se necessario (evitare query ripetute)

---

## FASE 11: Navigation & Menu ⏳

### 11.1 AppLayout Menu
- [ ] Aggiungere voce menu "Utenti" (solo per owner, manager)
  - [ ] Icona: Users
  - [ ] Link: /app/{tenant}/users
  - [ ] Condizionale: `@can('viewAny', App\Models\User::class)`

### 11.2 Conditional Menu Items
- [ ] Nascondere "Vendite" per receptionist e customer
- [ ] Nascondere "Configurazioni" per tutti tranne owner, manager, back_office
- [ ] Nascondere "Report Finanziari" per trainer, receptionist, customer

---

## FASE 12: Testing ⏳

### 12.1 Feature Tests - User Management
- [ ] `tests/Feature/User/UserManagementTest.php`
  - [ ] test_owner_can_create_users()
  - [ ] test_manager_can_create_users()
  - [ ] test_back_office_cannot_create_users()
  - [ ] test_owner_can_assign_roles()
  - [ ] test_manager_cannot_assign_owner_role()
  - [ ] test_user_cannot_delete_themselves()
  - [ ] test_must_have_at_least_one_owner()

### 12.2 Feature Tests - Permissions
- [ ] `tests/Feature/User/PermissionsTest.php`
  - [ ] test_trainer_can_only_see_assigned_customers()
  - [ ] test_trainer_cannot_see_sales()
  - [ ] test_trainer_cannot_see_financial_reports()
  - [ ] test_receptionist_can_checkin()
  - [ ] test_receptionist_cannot_create_sales()
  - [ ] test_back_office_can_see_all_sales()
  - [ ] test_customer_can_only_see_own_data()

### 12.3 Feature Tests - Trainer Assignment
- [ ] `tests/Feature/Training/TrainerAssignmentTest.php`
  - [ ] test_can_assign_trainer_to_customer()
  - [ ] test_can_remove_trainer_from_customer()
  - [ ] test_trainer_sees_only_assigned_customers()
  - [ ] test_cannot_assign_non_trainer_user()

### 12.4 Unit Tests
- [ ] `tests/Unit/User/UserServiceTest.php`
  - [ ] test_create_user_with_roles()
  - [ ] test_sync_roles()
  - [ ] test_delete_user()

- [ ] `tests/Unit/User/RolesSeedersTest.php`
  - [ ] test_roles_are_seeded()
  - [ ] test_permissions_are_seeded()
  - [ ] test_role_permissions_are_assigned()

### 12.5 Browser Tests (Dusk, opzionale)
- [ ] test_owner_can_invite_user_via_ui()
- [ ] test_assign_trainer_to_customer_flow()
- [ ] test_trainer_only_sees_assigned_customers()

---

## FASE 13: Migration Tenant Esistenti ⏳

### 13.1 Script di Migrazione
- [ ] Creare comando Artisan `php artisan tenant:migrate-roles`
  - [ ] Per ogni tenant esistente:
    - [ ] Esegui migrations Spatie
    - [ ] Esegui seeders (roles, permissions)
    - [ ] Identifica primo utente → assegna role "owner"
    - [ ] Altri utenti → assegna role "staff" di default (da rivedere manualmente)

### 13.2 Comunicazione Utenti
- [ ] Preparare email/notifica per owner tenant esistenti:
  - [ ] Spiega nuovo sistema ruoli
  - [ ] Chiedi di verificare e assegnare ruoli corretti
  - [ ] Link alla documentazione

---

## FASE 14: Documentation ⏳

### 14.1 Documentazione Tecnica
- [ ] Aggiornare `USER_ROLES_MANAGEMENT_PLAN.md`
  - [ ] Architettura finale implementata
  - [ ] Schema ER per relazioni
  - [ ] Esempi di query con scope

### 14.2 User Guide
- [ ] Creare `docs/USER_GUIDE_ROLES.md`
  - [ ] Cosa può fare ogni ruolo
  - [ ] Come invitare nuovi utenti
  - [ ] Come assegnare trainer a clienti
  - [ ] FAQ comuni

### 14.3 Admin Guide
- [ ] Creare `docs/ADMIN_GUIDE_ROLES.md`
  - [ ] Come creare ruoli custom
  - [ ] Come modificare permissions
  - [ ] Best practices gestione utenti

---

## FASE 15: Security & Performance ⏳

### 15.1 Security Audit
- [ ] Verificare tenant isolation:
  - [ ] User di tenant A non può vedere users di tenant B
  - [ ] Roles di tenant A non accessibili da tenant B
- [ ] Verificare protezione owner:
  - [ ] Owner non può auto-eliminarsi
  - [ ] Deve sempre esserci almeno un owner
- [ ] Verificare permission checks su TUTTI gli endpoint sensibili
- [ ] Testare SQL injection con ruoli/permissions

### 15.2 Performance
- [ ] Aggiungere eager loading per roles nelle query users:
  ```php
  User::with('roles')->get();
  ```
- [ ] Cachare permissions per request (Spatie lo fa di default)
- [ ] Indici su customer_trainer per query veloci

### 15.3 Logging
- [ ] Loggare tutte le operazioni sui ruoli:
  - [ ] Creazione utente
  - [ ] Assegnazione ruolo
  - [ ] Rimozione ruolo
  - [ ] Eliminazione utente
- [ ] Usare Spatie Activity Log (già installato?)

---

## FASE 16: Polish & UX ⏳

### 16.1 UI Improvements
- [ ] Tooltips su ruoli per spiegare cosa possono fare
- [ ] Animazioni transizioni dialogs
- [ ] Loading states durante salvataggio
- [ ] Toast notifications per successo/errore

### 16.2 Onboarding Owner
- [ ] Durante registrazione tenant, mostrare guida rapida:
  - [ ] "Sei l'owner, puoi invitare altri utenti"
  - [ ] Link a "Invita primo utente"
- [ ] Email di benvenuto owner con guide

### 16.3 Accessibilità
- [ ] Verificare contrasto colori badge
- [ ] Aria labels per screen readers
- [ ] Keyboard navigation nei dialogs

---

## FASE 17: Deploy & Rollout ⏳

### 17.1 Staging Testing
- [ ] Deploy su staging
- [ ] Test completo tutti i flussi
- [ ] Test con dati reali anonimizzati

### 17.2 Production Deployment
- [ ] Backup database prima del deploy
- [ ] Deploy codice
- [ ] Eseguire migrations sul centrale (se necessario)
- [ ] Eseguire migrations su tutti i tenant:
  ```bash
  php artisan tenants:migrate --force
  ```
- [ ] Eseguire script migrazione ruoli:
  ```bash
  php artisan tenant:migrate-roles
  ```

### 17.3 Monitoring Post-Deploy
- [ ] Monitorare log errori per 48h
- [ ] Verificare performance query con roles
- [ ] Raccogliere feedback owner sui nuovi ruoli

---

## FASE 18: Future Enhancements ⏳

### 18.1 Inviti via Email
- [ ] Sistema di invitation tokens
- [ ] Email template invito
- [ ] Pagina accettazione invito
- [ ] Auto-creazione account su primo login

### 18.2 App Mobile Customer
- [ ] API per customer role
- [ ] Autenticazione mobile
- [ ] View solo propri dati

### 18.3 Activity Tracking
- [ ] Dashboard attività utenti
- [ ] Report utilizzo per owner
- [ ] Audit log completo

---

## Note e Decisioni

### Decisioni Prese
- ✅ Ruoli nel database tenant (non centrale)
- ✅ 6 ruoli predefiniti: owner, manager, back_office, trainer, receptionist, customer
- ✅ Permissions granulari per area funzionale
- ✅ Query scoping automatico per trainer
- ✅ Customer.user_id per accesso app mobile futuro

### Da Decidere
- ⏳ Sistema inviti email: priorità alta/media/bassa?
- ⏳ Ruoli custom subito o in v2?
- ⏳ Activity log completo o base?

### Rischi Identificati
- ⚠️ Memory exhaustion con HasRoles: risolto spostando roles in tenant DB
- ⚠️ Performance con molti trainer su un cliente: risolto con indici
- ⚠️ Tenant senza owner: prevenuto con validazioni

---

## Progress Tracking

**Fase 1**: ⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️ 0%
**Fase 2**: ⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️ 0%
**Fase 3**: ⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️ 0%
...
**Completamento Totale**: 0% (0/200+ tasks)

**Tempo Stimato**: 30-40 ore di sviluppo

---

## Prossimo Step

**Quando sei pronto per iniziare, dimmi e partiremo dalla Fase 1!**

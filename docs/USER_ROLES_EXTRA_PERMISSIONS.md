# Implementazione Permessi Extra per Utenti

## Obiettivo
Permettere agli utenti di avere **un ruolo principale** con i suoi permessi base, più **permessi extra individuali** assegnati direttamente all'utente.

## Esempio d'Uso
- **Ruolo principale**: "Receptionist" → permessi: check-in, vendite base
- **Permessi extra**: "customers.view_financial" → può vedere dati finanziari clienti

## Stato Attuale

### ✅ Completato (Backend)
1. **UserController@show** modificato per separare:
   - `main_role`: Il ruolo principale dell'utente
   - `extra_permissions`: Array di permessi non inclusi nel ruolo
   - `all_permissions`: Tutti i permessi (ruolo + extra)
   - `all_available_permissions`: Lista completa permessi per UI

### 📋 Da Completare

#### 1. Frontend - user-show.tsx
**File**: `resources/js/pages/users/user-show.tsx`

**Modifiche necessarie**:
```typescript
// Aggiornare interfacce TypeScript
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  main_role: {
    id: number;
    name: string;
    permissions: Array<{ id: number; name: string }>;
  } | null;
  extra_permissions: string[];  // Array di permission names
  all_permissions: string[];    // Tutti i permessi
}

interface UserShowProps extends PageProps {
  user: User;
  available_roles: Array<{ id: number; name: string; description: string }>;
  all_available_permissions: Array<{
    id: number;
    name: string;
    category: string;
  }>;
}
```

**Nuova sezione UI da aggiungere**:
- Card "Ruolo Principale" → mostra il ruolo e i suoi permessi base
- Card "Permessi Extra" → lista dei permessi extra con badge
- Button "Gestisci Permessi Extra" → apre dialog

#### 2. Dialog Permessi Extra
**Nuovo componente**: `resources/js/components/users/dialogs/ManageExtraPermissionsDialog.tsx`

**Funzionalità**:
- Mostra tutti i permessi disponibili raggruppati per categoria
- Evidenzia i permessi già inclusi nel ruolo (disabilitati)
- Permette di selezionare/deselezionare permessi extra
- Checkbox "Seleziona tutti" per categoria

**Props**:
```typescript
interface ManageExtraPermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  rolePermissions: string[];        // Permessi del ruolo (read-only)
  extraPermissions: string[];       // Permessi extra correnti
  availablePermissions: Array<{
    id: number;
    name: string;
    category: string;
  }>;
  onSave: (permissionNames: string[]) => void;
}
```

#### 3. Backend - Endpoint Permessi Extra
**File**: `app/Http/Controllers/Application/Users/UserPermissionController.php` (nuovo)

**Metodi da creare**:
```php
/**
 * Update user's extra permissions.
 * Syncs direct permissions without affecting role.
 */
public function update(Request $request, User $user): RedirectResponse
{
    $this->authorize('managePermissions', $user);

    $validated = $request->validate([
        'permissions' => ['required', 'array'],
        'permissions.*' => ['string', 'exists:permissions,name'],
    ]);

    // Get role permissions
    $rolePermissions = $user->roles->first()?->permissions->pluck('name')->toArray() ?? [];

    // Only keep permissions that are NOT in the role
    $extraPermissions = array_diff($validated['permissions'], $rolePermissions);

    // Sync direct permissions (this replaces all direct permissions)
    $user->syncPermissions($extraPermissions);

    return redirect()
        ->route('app.users.show', ['tenant' => session('current_tenant_id'), 'user' => $user->id])
        ->with('success', 'Permessi aggiornati con successo.');
}
```

**Route da aggiungere**:
```php
// routes/tenant/web/users.php
Route::put('/{user}/permissions', [UserPermissionController::class, 'update'])
    ->name('app.users.permissions.update');
```

#### 4. Policy Update
**File**: `app/Policies/UserPolicy.php`

**Metodo da aggiungere**:
```php
public function managePermissions(User $currentUser, User $targetUser): bool
{
    // Owner e Manager possono gestire i permessi
    if ($currentUser->hasRole(['owner', 'manager'])) {
        return true;
    }

    // Non puoi gestire i tuoi permessi
    if ($currentUser->id === $targetUser->id) {
        return false;
    }

    return false;
}
```

#### 5. User Create/Edit Forms
**File**: `resources/js/components/users/forms/UserCreateForm.tsx`

**Aggiungere sezione**:
- Select per ruolo principale (già esistente)
- Sezione opzionale "Permessi Extra" con checkbox raggruppate per categoria

## Note Tecniche

### Spatie Permission - Direct Permissions
Spatie supporta nativamente i permessi diretti sugli utenti:
- `$user->givePermissionTo('permission.name')` → aggiunge permesso diretto
- `$user->syncPermissions(['perm1', 'perm2'])` → sostituisce tutti i permessi diretti
- `$user->getAllPermissions()` → ritorna ruolo + permessi diretti

### Calcolo Permessi Extra
```php
$rolePermissions = $user->roles->first()?->permissions->pluck('name')->toArray() ?? [];
$allPermissions = $user->getAllPermissions()->pluck('name')->toArray();
$extraPermissions = array_diff($allPermissions, $rolePermissions);
```

## UI/UX Considerations

### Colori e Badge
- **Permessi dal ruolo**: Badge blu (primary)
- **Permessi extra**: Badge verde (success)
- **Permessi non assegnati**: Badge grigio (default)

### User Experience
1. Quando cambio ruolo → mantengo i permessi extra se non in conflitto
2. Quando aggiungo permesso extra che è già nel ruolo → mostra warning
3. Dialog con ricerca/filtro per trovare permessi velocemente

## Testing Checklist

- [ ] Creare utente con ruolo "staff" (no permessi)
- [ ] Aggiungere permesso extra "sales.view"
- [ ] Verificare che getAllPermissions() ritorni solo "sales.view"
- [ ] Cambiare ruolo a "receptionist"
- [ ] Verificare che getAllPermissions() ritorni permessi receptionist + "sales.view"
- [ ] Rimuovere permesso extra
- [ ] Verificare che getAllPermissions() ritorni solo permessi receptionist

## Timeline Stimato
- Backend endpoint: 30 min
- Frontend dialog: 1h
- UI user-show update: 30 min
- Testing: 30 min
- **Totale**: ~2.5 ore

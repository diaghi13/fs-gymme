<?php

namespace App\Http\Controllers\Application\Roles;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(): Response
    {
        $this->authorize('managePermissions', User::class);

        $roles = Role::withCount(['permissions', 'users'])
            ->get()
            ->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions_count' => $role->permissions_count,
                'users_count' => $role->users_count,
                'is_system' => in_array($role->name, ['owner', 'manager', 'back_office', 'staff', 'trainer', 'receptionist', 'customer']),
                'description' => $this->getRoleDescription($role->name),
            ]);

        return Inertia::render('roles/role-index', [
            'roles' => $roles,
        ]);
    }

    private function getRoleDescription(string $roleName): string
    {
        return match ($roleName) {
            'owner' => 'Accesso completo a tutto',
            'manager' => 'Tutti i permessi eccetto gestione abbonamento',
            'back_office' => 'Gestione amministrativa completa',
            'staff' => 'Accesso base senza permessi predefiniti',
            'trainer' => 'Gestione clienti assegnati e allenamenti',
            'receptionist' => 'Check-in e vendite base',
            'customer' => 'Accesso limitato per clienti finali',
            default => 'Ruolo personalizzato',
        };
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $this->authorize('managePermissions', User::class);

        $permissions = Permission::all()
            ->groupBy(function ($permission) {
                return explode('.', $permission->name)[0];
            })
            ->map(function ($group, $key) {
                return [
                    'category' => $key,
                    'permissions' => $group->map(fn ($p) => [
                        'name' => $p->name,
                        'label' => ucfirst(str_replace(['.', '_'], [' - ', ' '], $p->name)),
                    ]),
                ];
            })
            ->values();

        return Inertia::render('roles/role-create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('managePermissions', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (! empty($validated['permissions'])) {
            $role->givePermissionTo($validated['permissions']);
        }

        return redirect()
            ->route('app.roles.index', ['tenant' => session('current_tenant_id')])
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {
        $this->authorize('managePermissions', User::class);

        $role->load(['permissions', 'users']);

        return Inertia::render('roles/role-show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'is_system' => in_array($role->name, ['owner', 'manager', 'back_office', 'staff', 'trainer', 'receptionist', 'customer']),
                'description' => $this->getRoleDescription($role->name),
                'permissions' => $role->permissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
                'users' => $role->users->map(fn ($user) => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                ]),
            ],
        ]);
    }

    /**
     * Show the form for editing the role.
     */
    public function edit(Role $role): Response
    {
        $this->authorize('managePermissions', User::class);

        $role->load('permissions');

        $allPermissions = Permission::all();
        $groupedPermissions = $allPermissions
            ->groupBy(function ($permission) {
                return explode('.', $permission->name)[0];
            })
            ->map(function ($group, $category) {
                return $group->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'category' => $category,
                ])->values();
            });

        return Inertia::render('roles/role-edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $this->getRoleDescription($role->name),
                'permissions' => $role->permissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
            ],
            'all_permissions' => $allPermissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'category' => explode('.', $p->name)[0]]),
            'grouped_permissions' => $groupedPermissions,
        ]);
    }

    /**
     * Update the role.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('managePermissions', User::class);

        // Cannot rename system roles
        $isSystem = in_array($role->name, ['owner', 'manager', 'back_office', 'staff', 'trainer', 'receptionist', 'customer']);

        $validated = $request->validate([
            'name' => $isSystem ? [] : ['required', 'string', 'max:255', 'unique:roles,name,'.$role->id],
            'description' => ['nullable', 'string'],
            'permissions' => ['array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        if (! $isSystem && isset($validated['name'])) {
            $role->update(['name' => $validated['name']]);
        }

        // Sync permissions by ID
        if (isset($validated['permissions'])) {
            $role->syncPermissions(Permission::whereIn('id', $validated['permissions'])->pluck('name'));
        }

        return redirect()
            ->route('app.roles.show', ['tenant' => session('current_tenant_id'), 'role' => $role->id])
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('managePermissions', User::class);

        // Cannot delete system roles
        $isSystem = in_array($role->name, ['owner', 'manager', 'back_office', 'staff', 'trainer', 'receptionist', 'customer']);

        if ($isSystem) {
            return back()->withErrors(['role' => 'Cannot delete system roles.']);
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return back()->withErrors(['role' => 'Cannot delete role with assigned users.']);
        }

        $role->delete();

        return redirect()
            ->route('app.roles.index', ['tenant' => session('current_tenant_id')])
            ->with('success', 'Role deleted successfully.');
    }
}

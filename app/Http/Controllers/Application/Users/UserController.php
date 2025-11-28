<?php

namespace App\Http\Controllers\Application\Users;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        public UserService $userService
    ) {}

    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::with(['roles'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'is_active' => $user->is_active,
                    'roles' => $user->roles->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]),
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('users/user-index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new user (invite).
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        $roles = Role::whereNotIn('name', ['customer'])
            ->get()
            ->map(function ($role) {
                return [
                    'value' => $role->name,
                    'label' => ucfirst(str_replace('_', ' ', $role->name)),
                ];
            });

        return Inertia::render('users/user-create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Invite/create a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        // Check if user can assign this role
        if (! $this->userService->canAssignRole($request->user(), $validated['role'])) {
            return back()->withErrors(['role' => 'You do not have permission to assign this role.']);
        }

        $user = $this->userService->inviteUser($validated, $validated['role']);

        return redirect()
            ->route('app.users.index', ['tenant' => session('current_tenant_id')])
            ->with('success', 'User invited successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        $user->load(['roles.permissions']);

        // Get available roles that the current user can assign
        $availableRoles = Role::whereNotIn('name', ['customer'])
            ->get()
            ->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $this->getRoleDescription($role->name),
            ]);

        // Get the main role (first role)
        $mainRole = $user->roles->first();

        // Get role permissions
        $rolePermissions = $mainRole ? $mainRole->permissions->pluck('name')->toArray() : [];

        // Get all user permissions
        $allPermissions = $user->getAllPermissions()->pluck('name')->toArray();

        // Extra permissions = all permissions - role permissions
        $extraPermissions = array_diff($allPermissions, $rolePermissions);

        return Inertia::render('users/user-show', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                'main_role' => $mainRole ? [
                    'id' => $mainRole->id,
                    'name' => $mainRole->name,
                    'permissions' => $mainRole->permissions->map(fn ($p) => ['id' => $p->id, 'name' => $p->name]),
                ] : null,
                'extra_permissions' => array_values($extraPermissions),
                'all_permissions' => $allPermissions,
            ],
            'available_roles' => $availableRoles,
            'all_available_permissions' => Permission::all()->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'category' => explode('.', $p->name)[0],
            ]),
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
            default => '',
        };
    }

    /**
     * Show the form for editing the user.
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('users/user-edit', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'tax_code' => ['nullable', 'string', 'max:16'],
            'is_active' => ['boolean'],
        ]);

        $this->userService->updateUser($user, $validated);

        return redirect()
            ->route('app.users.show', ['tenant' => session('current_tenant_id'), 'user' => $user->id])
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the user from tenant.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $this->userService->removeUserFromTenant($user);

        return redirect()
            ->route('app.users.index', ['tenant' => session('current_tenant_id')])
            ->with('success', 'User removed from tenant successfully.');
    }
}

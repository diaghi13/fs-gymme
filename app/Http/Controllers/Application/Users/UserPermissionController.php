<?php

namespace App\Http\Controllers\Application\Users;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class UserPermissionController extends Controller
{
    /**
     * Update user's extra permissions.
     *
     * Extra permissions are permissions assigned directly to the user,
     * in addition to the permissions they inherit from their role.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('managePermissions', $user);

        $validated = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        // Get the permission names from IDs
        $permissionIds = $validated['permissions'] ?? [];
        $permissions = Permission::whereIn('id', $permissionIds)->pluck('name')->toArray();

        // Get the user's role permissions to exclude them
        $rolePermissions = $user->getPermissionsViaRoles()->pluck('name')->toArray();

        // Filter out permissions that are already granted via role
        // Only sync permissions that are truly "extra"
        $extraPermissions = array_diff($permissions, $rolePermissions);

        // Sync only direct permissions (this replaces all direct permissions)
        $user->syncPermissions($extraPermissions);

        return redirect()
            ->route('app.users.show', ['tenant' => session('current_tenant_id'), 'user' => $user->id])
            ->with('success', 'Permessi extra aggiornati con successo.');
    }
}

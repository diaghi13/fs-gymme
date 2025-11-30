<?php

namespace App\Http\Controllers\Application\Users;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    public function __construct(
        public UserService $userService
    ) {}

    /**
     * Update user's role
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        // Check if user can assign this role
        $canAssign = $request->user()->can('assignRole', [$user, $validated['role']]);

        if (! $canAssign) {
            return back()->withErrors(['role' => 'You do not have permission to assign this role.']);
        }

        $this->userService->assignRole($user, $validated['role']);

        return back()->with('success', 'User role updated successfully.');
    }
}

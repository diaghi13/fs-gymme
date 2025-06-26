<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\CentralUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * CustomerShow the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // If the user is not active, log them out and redirect to the login page with an error message
        if (!Auth::user()->is_active) {
            Auth::logout();
            return redirect()
                ->route('login')
                ->withErrors(['email' => __('auth.inactive')]);
        }

        if (Auth::user()->hasRole('super-admin')) {
            // If the user is a super admin, redirect to the central dashboard
            return redirect()->intended(route('central.dashboard', absolute: false));
        }

        // If the user is not a super admin, check if they are a central user
        if (Auth::user()->hasRole('central-user')) {
            // If the user is a central user, redirect to the central dashboard
            return redirect()->route('central.dashboard');
        }

        // If the user is not a central user, redirect to the tenant selection page
        if (!Auth::user() instanceof CentralUser) {
            return redirect()->route('app.tenants.select');
        }

        if (!Auth::user()->tenants) {
            // If the user has no tenants, redirect to the tenant creation page
            return redirect()->route('app.tenants.create');
        }

        if (Auth::user()->tenants->count() > 1) {
            // If the user has multiple tenants, redirect to the tenant selection page
            return redirect()->route('app.tenants.select');
        }

        return redirect()
            ->intended(route('app.dashboard', absolute: false) . '?tenant=' . Auth::user()->tenants->first()->id);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

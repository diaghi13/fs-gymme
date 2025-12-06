<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectToAppController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Tenant $tenant)
    {
        $request->session()->put('current_tenant_id', $tenant->id);

        // Get the central user
        $centralUser = Auth::user();

//        if ($centralUser) {
//            // Initialize tenant context to access tenant database
//            tenancy()->initialize($tenant);
//
//            // Find the tenant user by global_id
//            $tenantUser = \App\Models\User::where('global_id', $centralUser->global_id)->first();
//
//            // End tenancy before login to avoid database connection issues
//            tenancy()->end();
//
//            if ($tenantUser) {
//                // Login the tenant user (in central context, but user is from tenant DB)
//                Auth::login($centralUser);
//
//                \Log::info('User logged into tenant', [
//                    'tenant_id' => $tenant->id,
//                    'user_id' => $tenantUser->id,
//                    'global_id' => $centralUser->global_id,
//                ]);
//            } else {
//                \Log::warning('Tenant user not found for central user', [
//                    'tenant_id' => $tenant->id,
//                    'central_user_id' => $centralUser->id,
//                    'global_id' => $centralUser->global_id,
//                ]);
//            }
//        }

        return redirect()->to(route('app.dashboard', [
            'tenant' => $tenant->id,
        ]));
    }
}

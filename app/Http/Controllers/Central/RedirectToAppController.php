<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;

class RedirectToAppController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Tenant $tenant)
    {
        $request->session()->put('current_tenant_id', $tenant->id);

        return redirect()->to(route('app.dashboard', [
            'tenant' => $tenant->id,
        ]));
    }
}

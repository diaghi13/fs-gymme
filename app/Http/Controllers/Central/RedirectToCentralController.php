<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RedirectToCentralController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $request->session()->forget('current_tenant_id');

        return redirect()->route('central.dashboard');
    }
}

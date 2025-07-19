<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\Support\FinancialResource;
use Illuminate\Http\Request;

class FinancialResourcesToggleActiveController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, FinancialResource $financialResource)
    {
        $financialResource->update([
            'is_active' => !$financialResource->is_active,
        ]);

        return redirect()->back()
            ->with('status', 'success');
    }
}

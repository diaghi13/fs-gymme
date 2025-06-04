<?php

namespace App\Http\Controllers\Configurations;

use App\Http\Controllers\Controller;
use App\Models\Support\FinancialResource;
use Illuminate\Http\Request;

class FinancialResourcesSetDefaultController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, FinancialResource $financialResource)
    {
        $financialResource->update([
            'default' => true,
        ]);

        FinancialResource::where('type', $financialResource->type)
            ->where('id', '!=', $financialResource->id)
            ->update(['default' => false]);

        return to_route('configurations.financial-resources')
            ->with('status', 'success');
    }
}

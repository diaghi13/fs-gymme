<?php

namespace App\Http\Controllers\App\Configurations;

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

        return to_route('app.configurations.financial-resources')
            ->with('status', 'success');
    }
}

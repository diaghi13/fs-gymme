<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyConfigurationController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show()
    {
        return Inertia::render('configurations/company-configuration', [
            'company' => auth()->user()->company,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }
}

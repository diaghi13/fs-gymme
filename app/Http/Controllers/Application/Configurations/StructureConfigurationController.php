<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\Structure;
use Illuminate\Http\Request;

class StructureConfigurationController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show()
    {
        return inertia('configurations/structure-configuration', [
            'structure' => Structure::first(),
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

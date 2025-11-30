<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Structure;

class StructureController extends Controller
{
    /**
     * Switch to a different structure.
     */
    public function switch(Structure $structure)
    {
        // Structure is automatically resolved by route model binding
        // We need to disable global scopes to allow switching to any structure
        $structure = Structure::withoutGlobalScopes()
            ->where('id', $structure->id)
            ->firstOrFail();

        // Update both session and cookie to keep them in sync
        // Session is primary source, cookie is fallback
        session(['current_structure_id' => $structure->id]);

        return redirect()->back()
            ->withCookie(cookie('current_structure_id', $structure->id, 525600))
            ->with([
                'status' => 'success',
                'message' => 'Cambiato a '.$structure->name,
            ]);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentStructure
{
    /**
     * Handle an incoming request.
     *
     * Set the current structure_id in both session and cookie for the authenticated user.
     * This is used by StructureScope to filter data by structure.
     * Using both session (primary) and cookie (fallback) for maximum reliability.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $structureId = null;

            // Priority 1: Check if already in session
            if (session()->has('current_structure_id')) {
                $structureId = session()->get('current_structure_id');
            }
            // Priority 2: Check cookie
            elseif ($request->hasCookie('current_structure_id')) {
                $structureId = $request->cookie('current_structure_id');
                // Sync to session
                session(['current_structure_id' => $structureId]);
            }
            // Priority 3: Set default
            else {
                // Get first structure for this tenant, or default to 1
                $structureId = \App\Models\Structure::withoutGlobalScopes()->first()?->id ?? 1;

                // Save in both session and cookie
                session(['current_structure_id' => $structureId]);
                cookie()->queue('current_structure_id', $structureId, 525600);
            }
        }

        return $next($request);
    }
}

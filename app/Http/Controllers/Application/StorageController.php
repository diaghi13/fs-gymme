<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StorageController extends Controller
{
    /**
     * Serve files from tenant's public storage
     */
    public function show(Request $request, string $path): Response
    {
        // The tenant is already initialized by the middleware
        $disk = \Storage::disk('public');

        // Check if file exists
        if (! $disk->exists($path)) {
            abort(404);
        }

        // Get file contents and mime type
        $file = $disk->get($path);
        $mimeType = $disk->mimeType($path);

        // Return file response with proper headers
        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'public, max-age=31536000');
    }
}

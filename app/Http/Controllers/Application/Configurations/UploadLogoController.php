<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Models\TenantSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadLogoController extends Controller
{
    /**
     * Upload PDF logo
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');

            // Delete old logo if exists
            $oldLogoPath = TenantSetting::get('invoice.pdf_logo_path');
            if ($oldLogoPath && Storage::disk('tenant')->exists($oldLogoPath)) {
                Storage::disk('tenant')->delete($oldLogoPath);
            }

            // Store new logo in tenant storage
            $path = $file->store('logos', 'tenant');

            // Save path to settings
            TenantSetting::set('invoice.pdf_logo_path', $path, 'invoice', 'PDF invoice logo path');

            return response()->json([
                'success' => true,
                'path' => $path,
                'message' => 'Logo caricato con successo',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Nessun file caricato',
        ], 400);
    }
}

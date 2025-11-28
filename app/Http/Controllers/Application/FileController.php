<?php

namespace App\Http\Controllers\Application;

use App\Http\Controllers\Controller;
use App\Models\File;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    /**
     * Display a listing of files for a specific fileable
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fileable_type' => 'required|string',
            'fileable_id' => 'required|integer',
            'type' => 'nullable|string',
        ]);

        $query = File::where('fileable_type', $validated['fileable_type'])
            ->where('fileable_id', $validated['fileable_id'])
            ->with('uploaded_by');

        if (isset($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        $files = $query->orderBy('created_at', 'desc')->get();

        return response()->json($files);
    }

    /**
     * Store a newly uploaded file
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:51200', // 50MB max
            'fileable_type' => 'required|string',
            'fileable_id' => 'required|integer',
            'type' => 'required|string|max:50',
            'description' => 'nullable|string|max:1000',
            'expires_at' => 'nullable|date',
        ]);

        $uploadedFile = $request->file('file');

        // Generate unique filename
        $fileName = Str::uuid().'.'.$uploadedFile->getClientOriginalExtension();

        // Store file
        $path = $uploadedFile->storeAs(
            'files/'.$validated['fileable_type'].'/'.$validated['fileable_id'],
            $fileName,
            'local'
        );

        // Create file record
        $file = File::create([
            'fileable_type' => $validated['fileable_type'],
            'fileable_id' => $validated['fileable_id'],
            'type' => $validated['type'],
            'name' => $uploadedFile->getClientOriginalName(),
            'file_name' => $fileName,
            'path' => $path,
            'disk' => 'local',
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
            'description' => $validated['description'] ?? null,
            'uploaded_by' => $request->user()->id,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        $file->load('uploaded_by');

        return response()->json([
            'message' => 'File caricato con successo',
            'file' => $file,
        ], 201);
    }

    /**
     * Download a file
     */
    public function download(File $file): StreamedResponse
    {
        if (! Storage::disk($file->disk)->exists($file->path)) {
            abort(404, 'File not found');
        }

        return Storage::disk($file->disk)->download($file->path, $file->name);
    }

    /**
     * Display the specified file
     */
    public function show(File $file): StreamedResponse
    {
        if (! Storage::disk($file->disk)->exists($file->path)) {
            abort(404, 'File not found');
        }

        return Storage::disk($file->disk)->response($file->path);
    }

    /**
     * Update file metadata
     */
    public function update(Request $request, File $file): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'sometimes|string|max:50',
            'description' => 'nullable|string|max:1000',
            'expires_at' => 'nullable|date',
        ]);

        $file->update($validated);

        return response()->json([
            'message' => 'File aggiornato con successo',
            'file' => $file->fresh(['uploaded_by']),
        ]);
    }

    /**
     * Remove the specified file
     */
    public function destroy(File $file): JsonResponse
    {
        $file->delete();

        return response()->json([
            'message' => 'File eliminato con successo',
        ]);
    }
}

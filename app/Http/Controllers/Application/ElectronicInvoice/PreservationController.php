<?php

namespace App\Http\Controllers\Application\ElectronicInvoice;

use App\Http\Controllers\Controller;
use App\Services\Sale\ElectronicInvoicePreservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PreservationController extends Controller
{
    public function __construct(
        private ElectronicInvoicePreservationService $preservationService
    ) {}

    /**
     * Get preservation statistics for dashboard
     */
    public function stats(): JsonResponse
    {
        $stats = $this->preservationService->getStatistics();

        return response()->json($stats);
    }

    /**
     * Export preservation archive as ZIP
     */
    public function export(Request $request): StreamedResponse
    {
        $request->validate([
            'year' => 'required|integer|min:2015|max:'.(date('Y') + 1),
            'month' => 'nullable|integer|min:1|max:12',
        ]);

        $year = (int) $request->input('year');
        $month = $request->input('month') ? (int) $request->input('month') : null;

        // Export period
        $zipPath = $this->preservationService->exportPeriod($year, $month);

        if (! $zipPath || ! Storage::exists($zipPath)) {
            abort(404, 'Nessun archivio trovato per il periodo selezionato');
        }

        $filename = $month
            ? "preservation_{$year}_{$month}.zip"
            : "preservation_{$year}.zip";

        return Response::streamDownload(function () use ($zipPath) {
            echo Storage::get($zipPath);
        }, $filename, [
            'Content-Type' => 'application/zip',
        ]);
    }

    /**
     * Run manual preservation for current month
     */
    public function runManual(): JsonResponse
    {
        try {
            $result = $this->preservationService->preserveMonth(
                year: (int) date('Y'),
                month: (int) date('m')
            );

            return response()->json([
                'success' => true,
                'message' => 'Conservazione completata con successo',
                'preserved_count' => count($result['preserved']),
                'skipped_count' => count($result['skipped']),
                'failed_count' => count($result['failed']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante la conservazione: '.$e->getMessage(),
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Application\Configurations;

use App\Http\Controllers\Controller;
use App\Services\Sale\GdprComplianceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GdprComplianceController extends Controller
{
    public function __construct(
        protected GdprComplianceService $gdprService
    ) {}

    /**
     * Display GDPR compliance dashboard
     */
    public function index(): Response
    {
        $dashboard = $this->gdprService->getRetentionDashboard();

        return Inertia::render('configurations/gdpr-compliance', [
            'dashboard' => $dashboard,
        ]);
    }

    /**
     * Generate compliance report (JSON download)
     */
    public function report(Request $request)
    {
        $format = $request->query('format', 'json');
        $report = $this->gdprService->generateComplianceReport($format);

        if ($format === 'json') {
            return response()->json($report);
        }

        return response($report)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="gdpr-compliance-report-'.now()->format('Y-m-d').'.json"');
    }

    /**
     * Trigger manual anonymization (dry-run preview)
     */
    public function preview()
    {
        $result = $this->gdprService->anonymizeExpiredInvoices(dryRun: true);

        return response()->json([
            'success' => true,
            'message' => 'Preview completed',
            'result' => $result,
        ]);
    }

    /**
     * Trigger manual anonymization (actual execution)
     */
    public function anonymize()
    {
        $result = $this->gdprService->anonymizeExpiredInvoices(dryRun: false);

        return response()->json([
            'success' => true,
            'message' => sprintf('Successfully anonymized %d invoices', $result['anonymized']),
            'result' => $result,
        ]);
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Sale\Sale;
use App\Services\Sale\SaleService;
use Illuminate\Console\Command;

class RecalculateStampDuty extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:recalculate-stamp-duty
                            {--dry-run : Run without making changes}
                            {--tenant= : Specific tenant ID to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate stamp duty (imposta di bollo) for existing sales with exempt nature codes';

    protected SaleService $saleService;

    public function __construct(SaleService $saleService)
    {
        parent::__construct();
        $this->saleService = $saleService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $tenantId = $this->option('tenant');

        $this->info('🔍 Searching for sales that may need stamp duty recalculation...');

        // Build query
        $query = Sale::query()
            ->with(['rows.vat_rate'])
            ->whereHas('rows.vat_rate', function ($q) {
                $q->whereIn('nature', ['N2.1', 'N2.2', 'N3.5', 'N3.6', 'N4']);
            });

        if ($tenantId) {
            $this->info("🎯 Processing tenant: {$tenantId}");
            // Filter by tenant if provided (implement tenant scoping logic)
        }

        $sales = $query->get();
        $this->info("📊 Found {$sales->count()} sales with exempt nature codes");

        if ($sales->isEmpty()) {
            $this->info('✅ No sales need recalculation');

            return self::SUCCESS;
        }

        $this->newLine();
        $updated = 0;
        $skipped = 0;

        $progressBar = $this->output->createProgressBar($sales->count());
        $progressBar->start();

        foreach ($sales as $sale) {
            $progressBar->advance();

            // Get current values
            $oldStampApplied = $sale->stamp_duty_applied;
            $oldStampAmount = $sale->stamp_duty_amount;

            // Recalculate
            if (! $dryRun) {
                $this->saleService->applyStampDuty($sale);
                $sale->refresh();
            } else {
                // Simulate calculation
                $summary = $sale->sale_summary;
                $grossTotal = $summary['gross_price'] ?? 0;
                $threshold = \App\Models\TenantSetting::get('invoice.stamp_duty.threshold', 77.47);

                if ($grossTotal > $threshold) {
                    $updated++;
                } else {
                    $skipped++;
                }

                continue;
            }

            // Check if changed
            if ($sale->stamp_duty_applied !== $oldStampApplied || $sale->stamp_duty_amount !== $oldStampAmount) {
                $updated++;
            } else {
                $skipped++;
            }
        }

        $progressBar->finish();
        $this->newLine(2);

        // Results
        if ($dryRun) {
            $this->warn('🔸 DRY RUN - No changes made');
        } else {
            $this->info('✅ Recalculation complete!');
        }

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total sales processed', $sales->count()],
                ['Updated', $updated],
                ['Skipped (no change)', $skipped],
            ]
        );

        if ($dryRun) {
            $this->newLine();
            $this->comment('💡 Run without --dry-run to apply changes');
        }

        return self::SUCCESS;
    }
}

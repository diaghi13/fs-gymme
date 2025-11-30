<?php

namespace App\Console\Commands;

use App\Models\Sale\ElectronicInvoice;
use App\Models\Tenant;
use App\Services\Sale\ElectronicInvoicePreservationService;
use Illuminate\Console\Command;

class PreserveElectronicInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'preserve:electronic-invoices
                            {--tenant= : ID specifico tenant (opzionale)}
                            {--month= : Mese da conservare (formato: YYYY-MM, default: mese precedente)}
                            {--force : Forza riconservazione anche se già conservate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Conserva fatture elettroniche accettate (obbligo normativo 10 anni)';

    /**
     * Execute the console command.
     */
    public function handle(ElectronicInvoicePreservationService $preservationService): int
    {
        $this->info('═══════════════════════════════════════════');
        $this->info('  Conservazione Sostitutiva Fatture');
        $this->info('═══════════════════════════════════════════');
        $this->newLine();

        // Determina periodo
        $month = $this->option('month') ?? now()->subMonth()->format('Y-m');
        [$year, $monthNumber] = explode('-', $month);

        $this->info("📅 Periodo: {$month}");
        $this->newLine();

        // Get tenants
        $tenantId = $this->option('tenant');
        $tenants = $tenantId
            ? Tenant::where('id', $tenantId)->get()
            : Tenant::all();

        if ($tenants->isEmpty()) {
            $this->error('Nessun tenant trovato!');

            return 1;
        }

        $this->info("🏢 Tenants da processare: {$tenants->count()}");
        $this->newLine();

        $totalStats = [
            'success' => 0,
            'skipped' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        // Process each tenant
        foreach ($tenants as $tenant) {
            $this->line("Processing tenant: {$tenant->name} ({$tenant->id})");

            $tenant->run(function () use ($preservationService, $year, $monthNumber, &$totalStats) {
                // Query fatture da conservare
                $query = ElectronicInvoice::where('sdi_status', 'accepted')
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $monthNumber);

                if (! $this->option('force')) {
                    $query->whereNull('preserved_at');
                }

                $invoices = $query->get();

                if ($invoices->isEmpty()) {
                    $this->warn('  → Nessuna fattura da conservare');

                    return;
                }

                $this->info("  → Fatture trovate: {$invoices->count()}");

                // Progress bar
                $bar = $this->output->createProgressBar($invoices->count());
                $bar->start();

                $results = $preservationService->preserveBatch($invoices);

                $bar->finish();
                $this->newLine();

                // Update totals
                $totalStats['success'] += $results['success'];
                $totalStats['skipped'] += $results['skipped'];
                $totalStats['failed'] += $results['failed'];
                $totalStats['errors'] = array_merge($totalStats['errors'], $results['errors']);

                // Show tenant results
                $this->info("  ✓ Successo: {$results['success']}");
                if ($results['skipped'] > 0) {
                    $this->comment("  ⊘ Saltate: {$results['skipped']}");
                }
                if ($results['failed'] > 0) {
                    $this->error("  ✗ Fallite: {$results['failed']}");
                }
                $this->newLine();
            });
        }

        // Final summary
        $this->newLine();
        $this->info('═══════════════════════════════════════════');
        $this->info('  Riepilogo Finale');
        $this->info('═══════════════════════════════════════════');
        $this->table(
            ['Risultato', 'Totale'],
            [
                ['✓ Successo', $totalStats['success']],
                ['⊘ Saltate', $totalStats['skipped']],
                ['✗ Fallite', $totalStats['failed']],
            ]
        );

        // Show errors if any
        if (! empty($totalStats['errors'])) {
            $this->newLine();
            $this->error('Errori Riscontrati:');
            foreach ($totalStats['errors'] as $error) {
                $this->line("  • {$error['transmission_id']}: {$error['error']}");
            }
        }

        $this->newLine();
        $this->info('✓ Conservazione completata!');

        return 0;
    }
}

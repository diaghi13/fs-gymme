<?php

namespace App\Console\Commands;

use App\Services\Sale\ElectronicInvoicePreservationService;
use Illuminate\Console\Command;

class CheckExpiringPreservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'electronic-invoice:check-expiring
                            {--days=90 : Soglia giorni per scadenza (default: 90)}
                            {--verify-integrity : Verifica anche integrità hash}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica fatture con conservazione in scadenza e integrità documenti';

    protected ElectronicInvoicePreservationService $preservationService;

    public function __construct(ElectronicInvoicePreservationService $preservationService)
    {
        parent::__construct();
        $this->preservationService = $preservationService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('═══════════════════════════════════════════════════════════');
        $this->info('  Verifica Scadenze Conservazione Sostitutiva');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->newLine();

        $daysThreshold = (int) $this->option('days');

        // Fatture in scadenza
        $expiring = $this->preservationService->getExpiringSoon($daysThreshold);

        // Fatture scadute
        $expired = $this->preservationService->getExpired();

        // Report scadenze
        if ($expiring->isNotEmpty()) {
            $this->warn("⚠️  {$expiring->count()} fatture in scadenza nei prossimi {$daysThreshold} giorni:");
            $this->newLine();

            $rows = $expiring->map(function ($invoice) {
                $daysLeft = now()->diffInDays($invoice->preservation_expires_at, false);
                $customer = $invoice->sale->customer->company_name ?? $invoice->sale->customer->full_name ?? 'N/A';

                return [
                    $invoice->transmission_id,
                    $customer,
                    $invoice->preserved_at->format('d/m/Y'),
                    $invoice->preservation_expires_at->format('d/m/Y'),
                    $daysLeft > 0 ? "{$daysLeft} giorni" : 'SCADUTA',
                ];
            });

            $this->table(
                ['Transmission ID', 'Cliente', 'Conservata il', 'Scade il', 'Giorni rimanenti'],
                $rows
            );
        } else {
            $this->info("✅ Nessuna fattura in scadenza nei prossimi {$daysThreshold} giorni");
        }

        // Report scadute
        if ($expired->isNotEmpty()) {
            $this->newLine();
            $this->error("❌ {$expired->count()} fatture con conservazione SCADUTA:");
            $this->newLine();

            $rows = $expired->map(function ($invoice) {
                $daysExpired = $invoice->preservation_expires_at->diffInDays(now());
                $customer = $invoice->sale->customer->company_name ?? $invoice->sale->customer->full_name ?? 'N/A';

                return [
                    $invoice->transmission_id,
                    $customer,
                    $invoice->preservation_expires_at->format('d/m/Y'),
                    "{$daysExpired} giorni fa",
                ];
            });

            $this->table(
                ['Transmission ID', 'Cliente', 'Scaduta il', 'Da quanto'],
                $rows
            );

            $this->warn('⚠️  Azione richiesta: Rinnovare conservazione per altri 10 anni o contattare provider');
        }

        // Verifica integrità (se richiesto)
        if ($this->option('verify-integrity')) {
            $this->newLine();
            $this->info('🔍 Verifica integrità documenti conservati...');
            $this->newLine();

            $allPreserved = \App\Models\Sale\ElectronicInvoice::whereNotNull('preserved_at')
                ->with('sale.customer')
                ->get();

            if ($allPreserved->isEmpty()) {
                $this->warn('Nessun documento conservato da verificare');

                return 0;
            }

            $bar = $this->output->createProgressBar($allPreserved->count());
            $bar->start();

            $integrityOk = 0;
            $integrityFailed = 0;
            $failures = [];

            foreach ($allPreserved as $invoice) {
                $result = $this->preservationService->verifyIntegrity($invoice);

                if ($result['xml'] && (! $invoice->pdf_hash || $result['pdf']) && (! $invoice->receipt_hash || $result['receipt'])) {
                    $integrityOk++;
                } else {
                    $integrityFailed++;
                    $failures[] = [
                        'invoice' => $invoice->transmission_id,
                        'errors' => $result['errors'],
                    ];
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine(2);

            // Report integrità
            $this->table(
                ['Metrica', 'Valore'],
                [
                    ['Documenti verificati', $allPreserved->count()],
                    ['✅ Integrità OK', $integrityOk],
                    ['❌ Integrità compromessa', $integrityFailed],
                ]
            );

            if (! empty($failures)) {
                $this->newLine();
                $this->error('❌ Documenti con integrità compromessa:');
                foreach ($failures as $failure) {
                    $this->line("  • {$failure['invoice']}:");
                    foreach ($failure['errors'] as $error) {
                        $this->line("    - {$error}");
                    }
                }
            }
        }

        $this->newLine();

        // Summary e raccomandazioni
        if ($expired->isNotEmpty() || $expiring->count() > 10) {
            $this->warn('⚠️  RACCOMANDAZIONI:');
            $this->line('  1. Configura backup automatico su storage esterno (S3)');
            $this->line('  2. Esegui conservazione giornaliera: Schedule::command(\'electronic-invoice:preserve\')->daily()');
            $this->line('  3. Monitor alert scadenze su dashboard');

            return 1;
        }

        $this->info('✅ Sistema conservazione in salute!');

        return 0;
    }
}

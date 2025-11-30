<?php

namespace App\Console\Commands;

use App\Models\Sale\ElectronicInvoice;
use App\Services\Sale\ElectronicInvoicePreservationService;
use Illuminate\Console\Command;

class PreserveAcceptedInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'electronic-invoice:preserve
                            {--force : Force preservation anche se già conservate}
                            {--days= : Conserva solo fatture accettate negli ultimi N giorni}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Conserva automaticamente fatture elettroniche accettate da SDI (obbligo 10 anni)';

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
        $this->info('  Conservazione Sostitutiva Fatture Elettroniche');
        $this->info('  Obbligo normativo: 10 anni (Art. 3, D.M. 17/6/2014)');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->newLine();

        // Query fatture da conservare
        $query = ElectronicInvoice::where('status', 'accepted');

        // Se non force, escludi già conservate
        if (! $this->option('force')) {
            $query->whereNull('preserved_at');
        }

        // Filtra per giorni se specificato
        if ($days = $this->option('days')) {
            $query->where('sent_at', '>=', now()->subDays($days));
        }

        $invoices = $query->with('sale.customer')->get();

        if ($invoices->isEmpty()) {
            $this->warn('⚠️  Nessuna fattura da conservare trovata.');
            $this->info('Criteri: status=accepted, non già conservate');

            return 0;
        }

        $this->info("📋 Trovate {$invoices->count()} fatture da conservare");
        $this->newLine();

        // Progress bar
        $bar = $this->output->createProgressBar($invoices->count());
        $bar->setFormat(' %current%/%max% [%bar%] %percent:3s%% - %message%');
        $bar->setMessage('Avvio conservazione...');
        $bar->start();

        $preserved = 0;
        $failed = 0;
        $errors = [];

        foreach ($invoices as $invoice) {
            $customerName = $invoice->sale->customer->company_name ?? $invoice->sale->customer->full_name ?? 'N/A';
            $bar->setMessage("Conservo: {$invoice->transmission_id} ({$customerName})");

            try {
                if ($this->preservationService->preserve($invoice)) {
                    $preserved++;
                } else {
                    $failed++;
                    $errors[] = "Fattura #{$invoice->id} ({$invoice->transmission_id}): Fallita conservazione";
                }
            } catch (\Exception $e) {
                $failed++;
                $errors[] = "Fattura #{$invoice->id} ({$invoice->transmission_id}): {$e->getMessage()}";
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info('═══════════════════════════════════════════════════════════');
        $this->info('  Riepilogo Conservazione');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->table(
            ['Metrica', 'Valore'],
            [
                ['Fatture processate', $invoices->count()],
                ['✅ Conservate con successo', $preserved],
                ['❌ Fallite', $failed],
                ['Data conservazione', now()->format('d/m/Y H:i:s')],
                ['Scadenza conservazione', now()->addYears(10)->format('d/m/Y')],
            ]
        );

        // Mostra errori se presenti
        if (! empty($errors)) {
            $this->newLine();
            $this->error('❌ Errori durante conservazione:');
            foreach ($errors as $error) {
                $this->line("  - {$error}");
            }
        }

        $this->newLine();

        // Check scadenze in arrivo
        $expiring = $this->preservationService->getExpiringSoon(90);
        if ($expiring->isNotEmpty()) {
            $this->warn("⚠️  {$expiring->count()} fatture con conservazione in scadenza nei prossimi 90 giorni");
            $this->info('Esegui: php artisan electronic-invoice:check-expiring per dettagli');
        }

        if ($failed > 0) {
            $this->error("⚠️  {$failed} fatture non conservate. Controlla i logs.");

            return 1;
        }

        $this->info('✅ Conservazione completata con successo!');

        return 0;
    }
}

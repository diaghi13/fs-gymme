<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SetupTenantFiscalData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tenant:setup-fiscal-data {tenant_id? : The tenant ID to setup}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup fiscal data for a tenant (required for electronic invoicing)';

    protected array $fiscalRegimes = [
        'RF01' => 'Regime ordinario',
        'RF02' => 'Contribuenti minimi (art. 1, c. 96-117, L. 244/2007)',
        'RF04' => 'Agricoltura e attività connesse e pesca (artt. 34 e 34-bis, DPR 633/1972)',
        'RF05' => 'Vendita sali e tabacchi (art. 74, c. 1, DPR 633/1972)',
        'RF06' => 'Commercio fiammiferi (art. 74, c. 1, DPR 633/1972)',
        'RF07' => 'Editoria (art. 74, c. 1, DPR 633/1972)',
        'RF08' => 'Gestione servizi telefonia pubblica (art. 74, c. 1, DPR 633/1972)',
        'RF09' => 'Rivendita documenti trasporto pubblico e sosta (art. 74, c. 1, DPR 633/1972)',
        'RF10' => 'Intrattenimenti, giochi e altre attività (art. 74, c. 6, DPR 633/1972)',
        'RF11' => 'Agenzie viaggi e turismo (art. 74-ter, DPR 633/1972)',
        'RF12' => 'Agriturismo (art. 5, c. 2, L. 413/1991)',
        'RF13' => 'Vendite a domicilio (art. 25-bis, c. 6, DPR 600/1973)',
        'RF14' => 'Rivendita beni usati, oggetti d\'arte, antiquariato (art. 36, DL 41/1995)',
        'RF15' => 'Agenzie art. vendite all\'asta beni usati, oggetti d\'arte, antiquariato (art. 40-bis, DL 41/1995)',
        'RF16' => 'IVA per cassa P.A. (art. 6, c. 5, DPR 633/1972)',
        'RF17' => 'IVA per cassa (art. 32-bis, DL 83/2012)',
        'RF18' => 'Altro',
        'RF19' => 'Regime forfettario (L. 190/2014)',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('═══════════════════════════════════════════');
        $this->info('  Setup Dati Fiscali Tenant - FE');
        $this->info('═══════════════════════════════════════════');
        $this->newLine();

        // Get tenant
        $tenantId = $this->argument('tenant_id');

        if (! $tenantId) {
            $tenants = Tenant::all();
            if ($tenants->isEmpty()) {
                $this->error('Nessun tenant trovato nel database!');

                return 1;
            }

            $choices = $tenants->mapWithKeys(fn ($t) => [$t->id => "{$t->name} ({$t->id})"]);
            $tenantId = $this->choice('Seleziona tenant', $choices->toArray());
        }

        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            $this->error("Tenant con ID '{$tenantId}' non trovato!");

            return 1;
        }

        $this->info("✓ Tenant: {$tenant->name}");
        $this->newLine();

        // Show current data if exists
        if ($tenant->vat_number || $tenant->pec_email) {
            $this->warn('⚠️  Dati fiscali già presenti per questo tenant:');
            $this->table(
                ['Campo', 'Valore Attuale'],
                [
                    ['P.IVA', $tenant->vat_number ?? '-'],
                    ['Codice Fiscale', $tenant->tax_code ?? '-'],
                    ['PEC Email', $tenant->pec_email ?? '-'],
                    ['Regime Fiscale', $tenant->fiscal_regime ?? '-'],
                ]
            );
            $this->newLine();

            if (! $this->confirm('Vuoi sovrascrivere i dati esistenti?', false)) {
                $this->info('Operazione annullata.');

                return 0;
            }
        }

        // Collect fiscal data
        $data = [];

        // P.IVA
        $data['vat_number'] = $this->askWithValidation(
            'P.IVA (11 cifre)',
            $tenant->vat_number,
            fn ($value) => strlen($value) === 11 && ctype_digit($value),
            'P.IVA deve essere esattamente 11 cifre numeriche'
        );

        // Codice Fiscale
        $data['tax_code'] = $this->askWithValidation(
            'Codice Fiscale (16 caratteri o 11 per azienda)',
            $tenant->tax_code ?? $data['vat_number'],
            fn ($value) => strlen($value) === 16 || strlen($value) === 11,
            'Codice Fiscale deve essere 16 caratteri (persona fisica) o 11 (azienda = P.IVA)'
        );

        // Address
        $data['address'] = $this->ask('Indirizzo completo (Via, N. civico)', $tenant->address);

        // City
        $data['city'] = $this->ask('Città', $tenant->city);

        // Postal code
        $data['postal_code'] = $this->askWithValidation(
            'CAP',
            $tenant->postal_code,
            fn ($value) => strlen($value) === 5 && ctype_digit($value),
            'CAP deve essere esattamente 5 cifre numeriche'
        );

        // Province
        $data['province'] = $this->askWithValidation(
            'Provincia (2 lettere, es: MI, RM, NA)',
            $tenant->province,
            fn ($value) => strlen($value) === 2 && ctype_alpha($value),
            'Provincia deve essere esattamente 2 lettere'
        );
        $data['province'] = strtoupper($data['province']);

        // Country
        $data['country'] = $this->ask('Paese (codice ISO, es: IT)', $tenant->country ?? 'IT');
        $data['country'] = strtoupper($data['country']);

        // PEC Email (OBBLIGATORIO!)
        $data['pec_email'] = $this->askWithValidation(
            'PEC Email (OBBLIGATORIA per fatturazione elettronica)',
            $tenant->pec_email,
            fn ($value) => filter_var($value, FILTER_VALIDATE_EMAIL),
            'Deve essere un indirizzo email valido'
        );

        if (! Str::contains($data['pec_email'], '@pec.')) {
            $this->warn('⚠️  L\'email non sembra essere una PEC (non contiene @pec.)');
            if (! $this->confirm('Confermi comunque?', true)) {
                $this->error('Setup annullato. PEC email obbligatoria.');

                return 1;
            }
        }

        // Fiscal regime
        $regimeChoices = collect($this->fiscalRegimes)->map(fn ($label, $code) => "$code - $label")->toArray();
        $selectedRegime = $this->choice(
            'Regime Fiscale',
            $regimeChoices,
            array_search($tenant->fiscal_regime ?? 'RF01', array_keys($this->fiscalRegimes))
        );
        $data['fiscal_regime'] = Str::before($selectedRegime, ' -');

        // Phone (optional)
        $data['phone'] = $this->ask('Telefono (opzionale)', $tenant->phone);

        // Summary
        $this->newLine();
        $this->info('═══════════════════════════════════════════');
        $this->info('  Riepilogo Dati da Salvare');
        $this->info('═══════════════════════════════════════════');
        $this->table(
            ['Campo', 'Valore'],
            collect($data)->map(fn ($value, $key) => [Str::headline($key), $value ?: '-'])->values()->toArray()
        );

        if (! $this->confirm('Confermi il salvataggio?', true)) {
            $this->warn('Operazione annullata.');

            return 0;
        }

        // Save
        $tenant->update($data);

        $this->newLine();
        $this->info('✅ Dati fiscali salvati con successo!');
        $this->newLine();

        // Verify data
        $this->info('═══════════════════════════════════════════');
        $this->info('  Verifica XML Fatturazione Elettronica');
        $this->info('═══════════════════════════════════════════');

        $missingFields = [];
        if (! $tenant->vat_number && ! $tenant->tax_code) {
            $missingFields[] = 'P.IVA o Codice Fiscale';
        }
        if (! $tenant->address) {
            $missingFields[] = 'Indirizzo';
        }
        if (! $tenant->city) {
            $missingFields[] = 'Città';
        }
        if (! $tenant->postal_code) {
            $missingFields[] = 'CAP';
        }
        if (! $tenant->province) {
            $missingFields[] = 'Provincia';
        }
        if (! $tenant->pec_email) {
            $missingFields[] = 'PEC Email';
        }
        if (! $tenant->fiscal_regime) {
            $missingFields[] = 'Regime Fiscale';
        }

        if (empty($missingFields)) {
            $this->info('✅ Tutti i campi obbligatori sono presenti!');
            $this->info('✅ Il tenant è pronto per generare fatture elettroniche.');
        } else {
            $this->error('⚠️  Campi obbligatori mancanti: '.implode(', ', $missingFields));
            $this->warn('Il tenant NON è pronto per generare fatture elettroniche.');
        }

        $this->newLine();

        return 0;
    }

    protected function askWithValidation(string $question, ?string $default, callable $validator, string $errorMessage): string
    {
        do {
            $value = $this->ask($question, $default);

            if ($validator($value)) {
                return $value;
            }

            $this->error("❌ {$errorMessage}");
        } while (true);
    }
}

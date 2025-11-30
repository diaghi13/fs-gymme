<?php

namespace App\Console\Commands;

use App\Models\Sale\Sale;
use App\Models\Tenant;
use Illuminate\Console\Command;

class FixSalesProgressiveNumberValue extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'sales:fix-progressive-value {--tenant= : Fix specific tenant only}';

    /**
     * The console command description.
     */
    protected $description = 'Popola il campo progressive_number_value sulle vendite esistenti estraendolo da progressive_number';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->option('tenant');

        if ($tenantId) {
            // Fix singolo tenant
            $tenant = Tenant::find($tenantId);
            if (! $tenant) {
                $this->error("Tenant {$tenantId} not found!");

                return 1;
            }
            $this->fixTenant($tenant);
        } else {
            // Fix tutti i tenant
            $tenants = Tenant::all();
            $this->info("Fixing {$tenants->count()} tenants...");

            foreach ($tenants as $tenant) {
                $this->fixTenant($tenant);
            }
        }

        $this->info('✅ Done!');

        return 0;
    }

    protected function fixTenant(Tenant $tenant): void
    {
        $tenant->run(function () use ($tenant) {
            $sales = Sale::whereNull('progressive_number_value')->get();

            if ($sales->isEmpty()) {
                $this->info("  Tenant {$tenant->id}: No sales to fix ✓");

                return;
            }

            $this->info("  Tenant {$tenant->id}: Fixing {$sales->count()} sales...");

            foreach ($sales as $sale) {
                // Estrai il numero dalla stringa progressive_number
                // Es: "0003" → 3, "FAT0005" → 5
                preg_match('/\d+$/', $sale->progressive_number, $matches);
                $value = isset($matches[0]) ? (int) $matches[0] : 0;

                // Estrai eventuale prefix
                preg_match('/^([A-Z]*)/', $sale->progressive_number, $prefixMatches);
                $prefix = $prefixMatches[1] ?: null;

                $sale->update([
                    'progressive_number_value' => $value,
                    'progressive_number_prefix' => $prefix,
                ]);

                $this->line("    - Sale #{$sale->id}: {$sale->progressive_number} → value={$value}");
            }

            $this->info("  Tenant {$tenant->id}: ✓ Fixed!");
        });
    }
}

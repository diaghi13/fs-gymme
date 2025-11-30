<?php

namespace App\Services\Sale;

use App\Models\Sale\ElectronicInvoice;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * Servizio Conservazione Sostitutiva Fatture Elettroniche
 * Conforme a: CAD (D.Lgs 82/2005), DMEF 17/06/2014
 *
 * Obbligo normativo: conservazione 10 anni
 * - XML fattura originale
 * - Ricevute SDI (RC, NS, DT, etc.)
 * - Hash integrità SHA-256
 * - Metadata JSON
 */
class ElectronicInvoicePreservationService
{
    protected string $preservationDisk = 'local';

    protected string $basePath = 'preservation/electronic_invoices';

    /**
     * Conserva una singola fattura elettronica
     */
    public function preserve(ElectronicInvoice $electronicInvoice): bool
    {
        // Verifica che la fattura sia stata accettata dal SDI
        if ($electronicInvoice->sdi_status !== 'accepted') {
            throw new \Exception('Solo fatture accettate dal SDI possono essere conservate');
        }

        // Verifica che non sia già conservata
        if ($electronicInvoice->isPreserved()) {
            return true; // Già conservata
        }

        try {
            // 1. Prepara directory strutturata per anno/mese
            $year = $electronicInvoice->created_at->year;
            $month = $electronicInvoice->created_at->format('m');
            $preservationPath = "{$this->basePath}/{$year}/{$month}/{$electronicInvoice->transmission_id}";

            // 2. Salva XML fattura originale
            $this->storeXml($preservationPath, $electronicInvoice);

            // 3. Salva ricevute SDI (se presenti)
            $this->storeReceipts($preservationPath, $electronicInvoice);

            // 4. Genera e salva metadata JSON
            $metadata = $this->generateMetadata($electronicInvoice);
            $this->storeMetadata($preservationPath, $metadata);

            // 5. Calcola hash integrità completo (XML + ricevute)
            $integrityHash = $this->calculateIntegrityHash($preservationPath);

            // 6. Aggiorna record database
            $electronicInvoice->update([
                'preserved_at' => now(),
                'preservation_hash' => $integrityHash,
                'preservation_path' => $preservationPath,
            ]);

            \Log::info('Electronic invoice preserved successfully', [
                'transmission_id' => $electronicInvoice->transmission_id,
                'preservation_path' => $preservationPath,
                'hash' => $integrityHash,
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to preserve electronic invoice', [
                'transmission_id' => $electronicInvoice->transmission_id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Conserva batch di fatture (per command mensile)
     */
    public function preserveBatch(Collection $electronicInvoices): array
    {
        $results = [
            'success' => 0,
            'skipped' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        foreach ($electronicInvoices as $invoice) {
            try {
                if ($invoice->isPreserved()) {
                    $results['skipped']++;

                    continue;
                }

                $this->preserve($invoice);
                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'transmission_id' => $invoice->transmission_id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Verifica integrità fattura conservata
     */
    public function verifyIntegrity(ElectronicInvoice $electronicInvoice): bool
    {
        if (! $electronicInvoice->isPreserved()) {
            return false;
        }

        $currentHash = $this->calculateIntegrityHash($electronicInvoice->preservation_path);

        return hash_equals($electronicInvoice->preservation_hash, $currentHash);
    }

    /**
     * Esporta fatture conservate per un periodo (ZIP)
     */
    public function exportPeriod(int $year, ?int $month = null): string
    {
        $query = ElectronicInvoice::whereNotNull('preserved_at')
            ->whereYear('created_at', $year);

        if ($month) {
            $query->whereMonth('created_at', $month);
        }

        $invoices = $query->get();

        if ($invoices->isEmpty()) {
            throw new \Exception('Nessuna fattura conservata trovata per il periodo specificato');
        }

        // Crea ZIP temporaneo
        $zipFileName = $month
            ? "conservazione_{$year}_{$month}.zip"
            : "conservazione_{$year}.zip";

        $zipPath = storage_path("app/temp/{$zipFileName}");

        // Assicurati che la directory temp esista
        if (! is_dir(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
        }

        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \Exception('Impossibile creare file ZIP');
        }

        foreach ($invoices as $invoice) {
            $basePath = $invoice->preservation_path;

            // Aggiungi XML
            $xmlPath = "{$basePath}/fattura.xml";
            if (Storage::disk($this->preservationDisk)->exists($xmlPath)) {
                $zip->addFromString(
                    "{$invoice->transmission_id}/fattura.xml",
                    Storage::disk($this->preservationDisk)->get($xmlPath)
                );
            }

            // Aggiungi metadata
            $metadataPath = "{$basePath}/metadata.json";
            if (Storage::disk($this->preservationDisk)->exists($metadataPath)) {
                $zip->addFromString(
                    "{$invoice->transmission_id}/metadata.json",
                    Storage::disk($this->preservationDisk)->get($metadataPath)
                );
            }

            // Aggiungi ricevute
            $receiptsPath = "{$basePath}/receipts";
            if (Storage::disk($this->preservationDisk)->exists($receiptsPath)) {
                $receipts = Storage::disk($this->preservationDisk)->files($receiptsPath);
                foreach ($receipts as $receipt) {
                    $zip->addFromString(
                        "{$invoice->transmission_id}/receipts/".basename($receipt),
                        Storage::disk($this->preservationDisk)->get($receipt)
                    );
                }
            }
        }

        $zip->close();

        return $zipPath;
    }

    /**
     * Ottieni statistiche conservazione
     */
    public function getStatistics(): array
    {
        $total = ElectronicInvoice::count();
        $preserved = ElectronicInvoice::whereNotNull('preserved_at')->count();
        $pending = ElectronicInvoice::whereNull('preserved_at')
            ->where('sdi_status', 'accepted')
            ->count();

        $byYear = ElectronicInvoice::whereNotNull('preserved_at')
            ->selectRaw('YEAR(created_at) as year, COUNT(*) as count')
            ->groupBy('year')
            ->orderBy('year', 'desc')
            ->get()
            ->pluck('count', 'year')
            ->toArray();

        $oldestPreserved = ElectronicInvoice::whereNotNull('preserved_at')
            ->orderBy('created_at')
            ->first();

        $storageSize = $this->calculateStorageSize();

        return [
            'total_invoices' => $total,
            'preserved_count' => $preserved,
            'pending_preservation' => $pending,
            'preservation_rate' => $total > 0 ? round(($preserved / $total) * 100, 2) : 0,
            'by_year' => $byYear,
            'oldest_preserved' => $oldestPreserved?->created_at->format('d/m/Y'),
            'storage_size_mb' => round($storageSize / 1024 / 1024, 2),
            'compliance_10_years' => $this->checkCompliance(),
        ];
    }

    /**
     * Salva XML fattura
     */
    protected function storeXml(string $basePath, ElectronicInvoice $electronicInvoice): void
    {
        $xmlPath = "{$basePath}/fattura.xml";
        Storage::disk($this->preservationDisk)->put($xmlPath, $electronicInvoice->xml_content);
    }

    /**
     * Salva ricevute SDI
     */
    protected function storeReceipts(string $basePath, ElectronicInvoice $electronicInvoice): void
    {
        // Salva ricevuta XML SDI se presente
        if ($electronicInvoice->sdi_receipt_xml) {
            $receiptPath = "{$basePath}/receipts/ricevuta_sdi.xml";
            Storage::disk($this->preservationDisk)->put($receiptPath, $electronicInvoice->sdi_receipt_xml);
        }

        // TODO: Se hai altri documenti SDI (NS, DT, etc.) salvali qui
    }

    /**
     * Genera metadata JSON per conservazione
     */
    protected function generateMetadata(ElectronicInvoice $electronicInvoice): array
    {
        $sale = $electronicInvoice->sale()->with('customer')->first();

        return [
            'version' => '1.0',
            'preserved_at' => now()->toIso8601String(),
            'preserved_by' => auth()->user()?->name ?? 'System',
            'tenant_id' => tenant('id'),
            'tenant_name' => tenant('name'),

            // Dati fattura
            'invoice' => [
                'id' => $electronicInvoice->id,
                'transmission_id' => $electronicInvoice->transmission_id,
                'external_id' => $electronicInvoice->external_id,
                'sdi_status' => $electronicInvoice->sdi_status,
                'created_at' => $electronicInvoice->created_at->toIso8601String(),
                'sdi_sent_at' => $electronicInvoice->sdi_sent_at?->toIso8601String(),
            ],

            // Dati vendita
            'sale' => [
                'id' => $sale->id,
                'number' => $sale->progressive_number,
                'date' => $sale->date?->format('Y-m-d'),
                'customer_name' => $sale->customer?->full_name,
                'total_amount' => $sale->sale_summary['final_total'] ?? 0,
            ],

            // Conformità normativa
            'compliance' => [
                'law' => 'CAD D.Lgs 82/2005 art. 3, DMEF 17/06/2014',
                'retention_years' => 10,
                'integrity_algorithm' => 'SHA-256',
                'timestamp_method' => 'Database timestamp + hash',
            ],
        ];
    }

    /**
     * Salva metadata JSON
     */
    protected function storeMetadata(string $basePath, array $metadata): void
    {
        $metadataPath = "{$basePath}/metadata.json";
        Storage::disk($this->preservationDisk)->put(
            $metadataPath,
            json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }

    /**
     * Calcola hash integrità SHA-256 di tutti i file conservati
     */
    protected function calculateIntegrityHash(string $preservationPath): string
    {
        $files = Storage::disk($this->preservationDisk)->allFiles($preservationPath);

        $combinedContent = '';
        foreach ($files as $file) {
            $combinedContent .= Storage::disk($this->preservationDisk)->get($file);
        }

        return hash('sha256', $combinedContent);
    }

    /**
     * Calcola dimensione totale storage conservazione
     */
    protected function calculateStorageSize(): int
    {
        $totalSize = 0;
        $files = Storage::disk($this->preservationDisk)->allFiles($this->basePath);

        foreach ($files as $file) {
            $totalSize += Storage::disk($this->preservationDisk)->size($file);
        }

        return $totalSize;
    }

    /**
     * Verifica compliance 10 anni
     */
    protected function checkCompliance(): bool
    {
        // Verifica che tutte le fatture > 10 anni siano ancora conservate
        $tenYearsAgo = now()->subYears(10);

        $oldInvoices = ElectronicInvoice::where('created_at', '<', $tenYearsAgo)->count();
        $oldPreserved = ElectronicInvoice::where('created_at', '<', $tenYearsAgo)
            ->whereNotNull('preserved_at')
            ->count();

        return $oldInvoices === $oldPreserved;
    }

    /**
     * Elimina fatture oltre retention (ATTENZIONE: solo per pulizia dopo 10+ anni)
     */
    public function cleanupOldPreservations(int $retentionYears = 10): int
    {
        $cutoffDate = now()->subYears($retentionYears);

        $oldInvoices = ElectronicInvoice::where('created_at', '<', $cutoffDate)
            ->whereNotNull('preserved_at')
            ->get();

        $deleted = 0;

        foreach ($oldInvoices as $invoice) {
            try {
                // Elimina file da storage
                Storage::disk($this->preservationDisk)->deleteDirectory($invoice->preservation_path);

                // Marca come eliminata (non cancellare record DB per audit)
                $invoice->update([
                    'preservation_deleted_at' => now(),
                ]);

                $deleted++;
            } catch (\Exception $e) {
                \Log::error('Failed to cleanup old preservation', [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $deleted;
    }
}

<?php

namespace App\Services\Sale;

use App\Models\Sale\ElectronicInvoice;
use App\Models\Sale\Sale;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Servizio per gestione GDPR Compliance
 * - Anonimizzazione automatica dopo 10 anni (retention legale)
 * - Dashboard scadenze retention
 * - Report compliance per revisori
 * - Pulizia automatica dati sensibili
 *
 * Normativa: GDPR Art. 17 (Diritto all'oblio) + CAD Art. 3 (Conservazione 10 anni)
 */
class GdprComplianceService
{
    /**
     * Periodo retention legale in anni (dopo decorrono tempi GDPR)
     */
    protected int $legalRetentionYears = 10;

    /**
     * Anonimizza fatture elettroniche oltre il periodo di retention
     *
     * @param  bool  $dryRun  Se true, non modifica i dati ma restituisce preview
     * @return array Report con statistiche anonimizzazione
     */
    public function anonymizeExpiredInvoices(bool $dryRun = false): array
    {
        $retentionDeadline = Carbon::now()->subYears($this->legalRetentionYears);

        // Trova fatture oltre il periodo di retention
        $expiredInvoices = ElectronicInvoice::whereHas('sale', function ($query) use ($retentionDeadline) {
            $query->where('date', '<=', $retentionDeadline);
        })
            ->whereNull('anonymized_at')
            ->with('sale.customer')
            ->get();

        $stats = [
            'total_found' => $expiredInvoices->count(),
            'anonymized' => 0,
            'failed' => 0,
            'dry_run' => $dryRun,
            'retention_deadline' => $retentionDeadline->toDateString(),
            'invoices_processed' => [],
        ];

        if ($expiredInvoices->isEmpty()) {
            Log::info('GDPR: No expired invoices to anonymize');

            return $stats;
        }

        foreach ($expiredInvoices as $invoice) {
            try {
                if (! $dryRun) {
                    $this->anonymizeInvoice($invoice);
                }

                $stats['anonymized']++;
                $stats['invoices_processed'][] = [
                    'invoice_id' => $invoice->id,
                    'transmission_id' => $invoice->transmission_id,
                    'document_date' => $invoice->sale->date,
                    'age_years' => Carbon::parse($invoice->sale->date)->diffInYears(Carbon::now()),
                ];
            } catch (\Exception $e) {
                $stats['failed']++;
                Log::error('GDPR: Failed to anonymize invoice', [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('GDPR: Anonymization process completed', $stats);

        return $stats;
    }

    /**
     * Anonimizza singola fattura elettronica
     */
    protected function anonymizeInvoice(ElectronicInvoice $invoice): void
    {
        DB::transaction(function () use ($invoice) {
            $sale = $invoice->sale;
            $customer = $sale->customer;

            // Anonimizza customer (se non ha altre vendite non anonimizzate)
            $otherSales = Sale::where('customer_id', $customer->id)
                ->where('id', '!=', $sale->id)
                ->whereDoesntHave('electronic_invoice', function ($query) {
                    $query->whereNotNull('anonymized_at');
                })
                ->exists();

            if (! $otherSales) {
                // Anonimizza customer se questa è l'unica/ultima vendita
                $customer->update([
                    'first_name' => 'ANONIMIZZATO',
                    'last_name' => 'GDPR',
                    'company_name' => 'ANONIMIZZATO GDPR',
                    'email' => 'anonymized_'.uniqid().'@gdpr.local',
                    'phone' => null,
                    'mobile' => null,
                    'vat_number' => null,
                    'tax_code' => 'ANONIMIZZATO',
                    'street' => 'ANONIMIZZATO',
                    'city' => 'ANONIMIZZATO',
                    'postal_code' => null,
                    'province' => null,
                    'country' => 'IT',
                    'notes' => null,
                ]);
            }

            // Anonimizza XML content (conserva struttura ma rimuove dati sensibili)
            if ($invoice->xml_content) {
                $invoice->xml_content = $this->anonymizeXmlContent($invoice->xml_content);
            }

            // Anonimizza PDF se presente
            if ($invoice->pdf_path && Storage::exists($invoice->pdf_path)) {
                Storage::delete($invoice->pdf_path);
                $invoice->pdf_path = null;
            }

            // Marca come anonimizzata
            $invoice->update([
                'anonymized_at' => now(),
                'anonymized_by' => auth()->id() ?? 'system',
            ]);

            Log::info('GDPR: Invoice anonymized', [
                'invoice_id' => $invoice->id,
                'transmission_id' => $invoice->transmission_id,
            ]);
        });
    }

    /**
     * Anonimizza contenuto XML mantenendo la struttura per compliance
     */
    protected function anonymizeXmlContent(string $xmlContent): string
    {
        $xml = new \DOMDocument;
        $xml->loadXML($xmlContent);

        // Anonimizza dati cedente (solo se non ente pubblico)
        $this->anonymizeXmlSection($xml, '//DatiAnagrafici/Anagrafica/Denominazione', 'ANONIMIZZATO GDPR');
        $this->anonymizeXmlSection($xml, '//DatiAnagrafici/Anagrafica/Nome', 'ANONIMIZZATO');
        $this->anonymizeXmlSection($xml, '//DatiAnagrafici/Anagrafica/Cognome', 'GDPR');

        // Anonimizza indirizzi
        $this->anonymizeXmlSection($xml, '//Indirizzo', 'ANONIMIZZATO');
        $this->anonymizeXmlSection($xml, '//Telefono', '0000000000');
        $this->anonymizeXmlSection($xml, '//Email', 'anonymized@gdpr.local');

        // Mantieni struttura fiscale (P.IVA/CF) ma marca come anonimizzato
        $this->anonymizeXmlSection($xml, '//CodiceFiscale', 'ANONIMIZZATO');

        // Descrizioni prodotti generiche
        $descrizioniNodes = $xml->getElementsByTagName('Descrizione');
        foreach ($descrizioniNodes as $node) {
            $node->nodeValue = 'Prodotto/Servizio (dati anonimizzati GDPR)';
        }

        return $xml->saveXML();
    }

    /**
     * Helper per anonimizzare sezione XML
     */
    protected function anonymizeXmlSection(\DOMDocument $xml, string $xpath, string $value): void
    {
        $domXPath = new \DOMXPath($xml);
        $nodes = $domXPath->query($xpath);

        foreach ($nodes as $node) {
            $node->nodeValue = $value;
        }
    }

    /**
     * Ottieni dashboard scadenze retention per revisori
     */
    public function getRetentionDashboard(): array
    {
        $now = Carbon::now();
        $retentionDeadline = $now->copy()->subYears($this->legalRetentionYears);
        $nearExpiryDeadline = $now->copy()->subYears($this->legalRetentionYears)->addMonths(3);

        return [
            'retention_years' => $this->legalRetentionYears,
            'retention_deadline' => $retentionDeadline->toDateString(),
            'stats' => [
                'total_invoices' => ElectronicInvoice::count(),
                'expired_not_anonymized' => ElectronicInvoice::whereHas('sale', function ($query) use ($retentionDeadline) {
                    $query->where('date', '<=', $retentionDeadline);
                })
                    ->whereNull('anonymized_at')
                    ->count(),
                'near_expiry' => ElectronicInvoice::whereHas('sale', function ($query) use ($retentionDeadline, $nearExpiryDeadline) {
                    $query->whereBetween('date', [$retentionDeadline, $nearExpiryDeadline]);
                })
                    ->whereNull('anonymized_at')
                    ->count(),
                'already_anonymized' => ElectronicInvoice::whereNotNull('anonymized_at')->count(),
            ],
            'upcoming_expirations' => $this->getUpcomingExpirations(),
            'compliance_status' => $this->calculateComplianceStatus(),
        ];
    }

    /**
     * Ottieni lista prossime scadenze (prossimi 6 mesi)
     */
    protected function getUpcomingExpirations(): array
    {
        $now = Carbon::now();
        $retentionDeadline = $now->copy()->subYears($this->legalRetentionYears);
        $futureDeadline = $now->copy()->subYears($this->legalRetentionYears)->addMonths(6);

        $invoices = ElectronicInvoice::whereHas('sale', function ($query) use ($retentionDeadline, $futureDeadline) {
            $query->whereBetween('date', [$retentionDeadline, $futureDeadline]);
        })
            ->whereNull('anonymized_at')
            ->with('sale.customer')
            ->orderBy('created_at')
            ->take(20)
            ->get();

        return $invoices->map(function ($invoice) use ($now) {
            $documentDate = Carbon::parse($invoice->sale->date);
            $expiryDate = $documentDate->copy()->addYears($this->legalRetentionYears);

            return [
                'invoice_id' => $invoice->id,
                'transmission_id' => $invoice->transmission_id,
                'customer_name' => $invoice->sale->customer->full_name ?? 'N/A',
                'document_date' => $documentDate->toDateString(),
                'expiry_date' => $expiryDate->toDateString(),
                'days_until_expiry' => $now->diffInDays($expiryDate, false),
                'age_years' => $documentDate->diffInYears($now),
            ];
        })->toArray();
    }

    /**
     * Calcola stato compliance GDPR
     */
    protected function calculateComplianceStatus(): array
    {
        $retentionDeadline = Carbon::now()->subYears($this->legalRetentionYears);

        $total = ElectronicInvoice::whereHas('sale', function ($query) use ($retentionDeadline) {
            $query->where('date', '<=', $retentionDeadline);
        })->count();

        $anonymized = ElectronicInvoice::whereHas('sale', function ($query) use ($retentionDeadline) {
            $query->where('date', '<=', $retentionDeadline);
        })
            ->whereNotNull('anonymized_at')
            ->count();

        $compliancePercentage = $total > 0 ? round(($anonymized / $total) * 100, 2) : 100;

        return [
            'total_expired' => $total,
            'anonymized' => $anonymized,
            'non_compliant' => $total - $anonymized,
            'compliance_percentage' => $compliancePercentage,
            'status' => $compliancePercentage === 100 ? 'compliant' : ($compliancePercentage >= 90 ? 'warning' : 'critical'),
        ];
    }

    /**
     * Genera report compliance per revisori (PDF/Excel export)
     */
    public function generateComplianceReport(string $format = 'array'): array|string
    {
        $dashboard = $this->getRetentionDashboard();

        $report = [
            'generated_at' => now()->toDateTimeString(),
            'tenant_id' => tenant('id'),
            'tenant_name' => tenant('name'),
            'report_type' => 'GDPR Compliance Report',
            'retention_policy' => [
                'legal_retention_years' => $this->legalRetentionYears,
                'retention_deadline' => $dashboard['retention_deadline'],
                'applicable_law' => 'CAD Art. 3 + GDPR Art. 17',
            ],
            'compliance_status' => $dashboard['compliance_status'],
            'statistics' => $dashboard['stats'],
            'upcoming_expirations' => $dashboard['upcoming_expirations'],
            'recommendations' => $this->generateRecommendations($dashboard),
        ];

        if ($format === 'json') {
            return json_encode($report, JSON_PRETTY_PRINT);
        }

        return $report;
    }

    /**
     * Genera raccomandazioni basate sullo stato compliance
     */
    protected function generateRecommendations(array $dashboard): array
    {
        $recommendations = [];

        $expired = $dashboard['stats']['expired_not_anonymized'];
        $nearExpiry = $dashboard['stats']['near_expiry'];

        if ($expired > 0) {
            $recommendations[] = [
                'severity' => 'critical',
                'message' => "Ci sono {$expired} fatture oltre il periodo di retention che devono essere anonimizzate immediatamente per compliance GDPR.",
                'action' => 'Esegui: php artisan gdpr:anonymize-invoices',
            ];
        }

        if ($nearExpiry > 0) {
            $recommendations[] = [
                'severity' => 'warning',
                'message' => "{$nearExpiry} fatture raggiungeranno la scadenza nei prossimi 3 mesi.",
                'action' => 'Pianifica anonimizzazione automatica o manuale.',
            ];
        }

        if (empty($recommendations)) {
            $recommendations[] = [
                'severity' => 'success',
                'message' => 'Sistema completamente conforme GDPR. Nessuna azione richiesta.',
                'action' => null,
            ];
        }

        return $recommendations;
    }

    /**
     * Pulizia automatica dati sensibili non necessari
     * (es. log vecchi, cache, temp files)
     */
    public function cleanupSensitiveData(int $olderThanDays = 90): array
    {
        $stats = [
            'logs_deleted' => 0,
            'temp_files_deleted' => 0,
            'cache_cleared' => false,
        ];

        // Cleanup log files vecchi
        $logPath = storage_path('logs');
        $cutoffDate = Carbon::now()->subDays($olderThanDays);

        $files = glob($logPath.'/laravel-*.log');
        foreach ($files as $file) {
            $fileDate = Carbon::parse('@'.filemtime($file)); // Parse timestamp with @ prefix
            if ($fileDate->lt($cutoffDate)) {
                unlink($file);
                $stats['logs_deleted']++;
            }
        }

        // Cleanup temporary XML files
        $tempXmlFiles = Storage::disk('local')->files('temp/xml');
        foreach ($tempXmlFiles as $file) {
            $fileDate = Carbon::parse('@'.Storage::disk('local')->lastModified($file)); // Parse timestamp with @ prefix
            if ($fileDate->lt($cutoffDate)) {
                Storage::disk('local')->delete($file);
                $stats['temp_files_deleted']++;
            }
        }

        Log::info('GDPR: Sensitive data cleanup completed', $stats);

        return $stats;
    }
}

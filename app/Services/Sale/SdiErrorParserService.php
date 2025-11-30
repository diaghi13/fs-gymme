<?php

namespace App\Services\Sale;

use App\Enums\SdiErrorCodeEnum;
use App\Models\Sale\ElectronicInvoice;
use Illuminate\Support\Collection;

class SdiErrorParserService
{
    /**
     * Parse SDI error messages and return structured error data
     *
     * @return Collection<array{code: ?SdiErrorCodeEnum, raw_message: string, description: string, suggestion: string, severity: string, auto_fixable: bool, documentation_link: string}>
     */
    public function parseErrors(string $errorMessages): Collection
    {
        if (empty($errorMessages)) {
            return collect();
        }

        // Split multiple errors (separated by newline or semicolon)
        $messages = preg_split('/[\n;]+/', $errorMessages);

        return collect($messages)
            ->filter(fn ($msg) => ! empty(trim($msg)))
            ->map(function ($message) {
                $message = trim($message);
                $errorCode = SdiErrorCodeEnum::parseFromMessage($message);

                if ($errorCode) {
                    return [
                        'code' => $errorCode,
                        'raw_message' => $message,
                        'description' => $errorCode->getDescription(),
                        'suggestion' => $errorCode->getSuggestion(),
                        'severity' => $errorCode->getSeverity(),
                        'auto_fixable' => $errorCode->isAutoFixable(),
                        'documentation_link' => $errorCode->getDocumentationLink(),
                    ];
                }

                // Unknown error - return raw message
                return [
                    'code' => null,
                    'raw_message' => $message,
                    'description' => $message,
                    'suggestion' => 'Verifica i dati della fattura. Se il problema persiste, contatta il supporto.',
                    'severity' => 'medium',
                    'auto_fixable' => false,
                    'documentation_link' => 'https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/fatturazione-elettronica',
                ];
            });
    }

    /**
     * Get summary of errors grouped by severity
     */
    public function getErrorSummary(string $errorMessages): array
    {
        $errors = $this->parseErrors($errorMessages);

        return [
            'total' => $errors->count(),
            'critical' => $errors->where('severity', 'critical')->count(),
            'high' => $errors->where('severity', 'high')->count(),
            'medium' => $errors->where('severity', 'medium')->count(),
            'auto_fixable_count' => $errors->where('auto_fixable', true)->count(),
            'has_critical' => $errors->where('severity', 'critical')->isNotEmpty(),
            'primary_error' => $errors->first(), // Most important error
        ];
    }

    /**
     * Get actionable fix suggestions
     */
    public function getFixSuggestions(ElectronicInvoice $electronicInvoice): array
    {
        if (! $electronicInvoice->sdi_error_messages) {
            return [];
        }

        $errors = $this->parseErrors($electronicInvoice->sdi_error_messages);

        return $errors->map(function ($error) {
            return [
                'title' => $error['description'],
                'suggestion' => $error['suggestion'],
                'severity' => $error['severity'],
                'auto_fixable' => $error['auto_fixable'],
                'priority' => $this->getSeverityPriority($error['severity']),
            ];
        })
            ->sortByDesc('priority')
            ->values()
            ->toArray();
    }

    /**
     * Check if errors are fixable automatically
     */
    public function canAutoFix(string $errorMessages): bool
    {
        $errors = $this->parseErrors($errorMessages);

        // Can auto-fix only if ALL errors are auto-fixable
        return $errors->isNotEmpty() && $errors->every(fn ($error) => $error['auto_fixable']);
    }

    /**
     * Get most common error patterns
     */
    public function getMostCommonErrors(): array
    {
        return [
            [
                'code' => '00404',
                'description' => 'P.IVA cessionario non valida',
                'frequency' => 'Molto Comune',
                'quick_fix' => 'Controlla P.IVA cliente (11 cifre numeriche)',
            ],
            [
                'code' => '00433',
                'description' => 'Importi non coerenti',
                'frequency' => 'Comune',
                'quick_fix' => 'Ricalcola totali: Imponibile + IVA + Bollo',
            ],
            [
                'code' => '00423',
                'description' => 'Data fattura futura',
                'frequency' => 'Comune',
                'quick_fix' => 'Usa data corrente o passata',
            ],
            [
                'code' => '00466',
                'description' => 'IVA 0% senza Natura',
                'frequency' => 'Molto Comune',
                'quick_fix' => 'Aggiungi codice Natura (es: N4 per esenti)',
            ],
            [
                'code' => '00461',
                'description' => 'Numero fattura duplicato',
                'frequency' => 'Comune',
                'quick_fix' => 'Usa nuovo numero progressivo',
            ],
        ];
    }

    /**
     * Get severity priority for sorting
     */
    protected function getSeverityPriority(string $severity): int
    {
        return match ($severity) {
            'critical' => 3,
            'high' => 2,
            'medium' => 1,
            default => 0,
        };
    }

    /**
     * Generate user-friendly error message
     */
    public function getUserFriendlyMessage(string $errorMessages): string
    {
        $errors = $this->parseErrors($errorMessages);

        if ($errors->isEmpty()) {
            return 'Errore generico durante l\'invio. Riprova più tardi.';
        }

        $summary = $this->getErrorSummary($errorMessages);

        if ($summary['has_critical']) {
            return '⚠️ Errore critico nel formato XML. La fattura deve essere rigenerata.';
        }

        $primaryError = $summary['primary_error'];

        return "❌ {$primaryError['description']}. {$primaryError['suggestion']}";
    }

    /**
     * Get HTML formatted error report
     */
    public function getHtmlErrorReport(string $errorMessages): string
    {
        $errors = $this->parseErrors($errorMessages);

        if ($errors->isEmpty()) {
            return '<p>Nessun dettaglio errore disponibile.</p>';
        }

        $html = '<div class="sdi-error-report">';
        $html .= '<h4>Dettagli Errori SDI</h4>';

        foreach ($errors as $index => $error) {
            $severityClass = match ($error['severity']) {
                'critical' => 'danger',
                'high' => 'warning',
                default => 'info',
            };

            $html .= "<div class='alert alert-{$severityClass} mb-3'>";
            $html .= '<strong>Errore '.($index + 1).'</strong><br>';
            $html .= "<strong>Codice:</strong> {$error['code']?->value}<br>";
            $html .= "<strong>Descrizione:</strong> {$error['description']}<br>";
            $html .= "<strong>💡 Come risolvere:</strong> {$error['suggestion']}<br>";

            if ($error['auto_fixable']) {
                $html .= '<span class="badge bg-success">Auto-correggibile</span>';
            }

            $html .= '</div>';
        }

        $html .= '</div>';

        return $html;
    }
}

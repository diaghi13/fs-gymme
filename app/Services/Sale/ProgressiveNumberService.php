<?php

namespace App\Services\Sale;

use App\Models\Sale\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProgressiveNumberService
{
    /**
     * Generate next progressive number for a sale (thread-safe)
     *
     * Uses database pessimistic locking to ensure thread-safety
     * in concurrent environments
     */
    public function generateNext(
        int $year,
        ?string $prefix = null,
        ?int $structureId = null,
        ?string $documentTypeCode = null
    ): array {
        return DB::transaction(function () use ($year, $prefix, $structureId, $documentTypeCode) {
            // Lock the table to prevent concurrent inserts with same number
            // This is critical for legal compliance - no duplicate invoice numbers allowed
            $query = Sale::query()
                ->where('year', $year)
                ->lockForUpdate();

            // Optional: scope by structure
            if ($structureId) {
                $query->where('structure_id', $structureId);
            }

            // Optional: scope by document type
            if ($documentTypeCode) {
                $query->whereHas('document_type_electronic_invoice', function ($q) use ($documentTypeCode) {
                    $q->where('code', $documentTypeCode);
                });
            }

            // Get the maximum progressive number value for this year
            $maxValue = $query->max('progressive_number_value') ?? 0;

            // Increment for next number
            $nextValue = $maxValue + 1;

            // Build complete progressive number string
            $progressiveNumber = $this->formatProgressiveNumber($nextValue, $prefix);

            return [
                'progressive_number' => $progressiveNumber,
                'progressive_number_prefix' => $prefix,
                'progressive_number_value' => $nextValue,
                'year' => $year,
            ];
        });
    }

    /**
     * Generate next progressive number for current year
     */
    public function generateNextForCurrentYear(?string $prefix = null, ?int $structureId = null): array
    {
        return $this->generateNext(
            year: now()->year,
            prefix: $prefix,
            structureId: $structureId
        );
    }

    /**
     * Format progressive number with prefix and padding
     *
     * Examples:
     * - formatProgressiveNumber(1) => "0001"
     * - formatProgressiveNumber(1, "FAT") => "FAT0001"
     * - formatProgressiveNumber(123, "NC") => "NC0123"
     */
    public function formatProgressiveNumber(int $value, ?string $prefix = null): string
    {
        $paddedValue = Str::padLeft($value, 4, '0');

        if ($prefix) {
            return "{$prefix}{$paddedValue}";
        }

        return $paddedValue;
    }

    /**
     * Parse progressive number into components
     *
     * Returns: ['prefix' => 'FAT', 'value' => 123, 'full' => 'FAT0123']
     */
    public function parseProgressiveNumber(string $progressiveNumber): array
    {
        // Extract prefix (non-numeric characters at start)
        preg_match('/^([A-Z]*)(\d+)$/', $progressiveNumber, $matches);

        $prefix = $matches[1] ?? null;
        $value = isset($matches[2]) ? (int) $matches[2] : null;

        return [
            'prefix' => $prefix ?: null,
            'value' => $value,
            'full' => $progressiveNumber,
        ];
    }

    /**
     * Validate progressive number format
     */
    public function isValidFormat(string $progressiveNumber): bool
    {
        // Must be: optional prefix (letters) + digits
        return (bool) preg_match('/^[A-Z]*\d+$/', $progressiveNumber);
    }

    /**
     * Reset progressive numbering for a new year
     *
     * This is informational only - numbering resets automatically
     * by filtering on year
     */
    public function getYearStats(int $year, ?int $structureId = null): array
    {
        $query = Sale::query()->where('year', $year);

        if ($structureId) {
            $query->where('structure_id', $structureId);
        }

        return [
            'year' => $year,
            'total_invoices' => $query->count(),
            'max_progressive_value' => $query->max('progressive_number_value') ?? 0,
            'next_progressive_value' => ($query->max('progressive_number_value') ?? 0) + 1,
        ];
    }

    /**
     * Get progressive numbering info for a specific prefix
     */
    public function getPrefixStats(int $year, string $prefix, ?int $structureId = null): array
    {
        $query = Sale::query()
            ->where('year', $year)
            ->where('progressive_number_prefix', $prefix);

        if ($structureId) {
            $query->where('structure_id', $structureId);
        }

        return [
            'year' => $year,
            'prefix' => $prefix,
            'total_invoices' => $query->count(),
            'max_progressive_value' => $query->max('progressive_number_value') ?? 0,
            'next_progressive_value' => ($query->max('progressive_number_value') ?? 0) + 1,
        ];
    }

    /**
     * Check if a progressive number already exists
     */
    public function exists(string $progressiveNumber, int $year, ?int $structureId = null): bool
    {
        $query = Sale::query()
            ->where('progressive_number', $progressiveNumber)
            ->where('year', $year);

        if ($structureId) {
            $query->where('structure_id', $structureId);
        }

        return $query->exists();
    }

    /**
     * Suggest prefix based on document type
     */
    public function suggestPrefix(string $documentTypeCode): ?string
    {
        return match ($documentTypeCode) {
            'TD01' => null,           // Standard invoice - no prefix
            'TD04' => 'NC',           // Credit note (Nota di Credito)
            'TD05' => 'ND',           // Debit note (Nota di Debito)
            'TD07', 'TD08', 'TD09' => 'SF', // Simplified invoices
            'TD24' => 'DD',           // Deferred invoice
            'TD29' => 'IRR',          // Irregular invoice
            default => null,
        };
    }

    /**
     * Validate progressive sequence integrity for a year
     *
     * Returns array of missing numbers if any gaps found
     */
    public function validateSequenceIntegrity(int $year, ?int $structureId = null): array
    {
        $query = Sale::query()
            ->where('year', $year)
            ->orderBy('progressive_number_value');

        if ($structureId) {
            $query->where('structure_id', $structureId);
        }

        $values = $query->pluck('progressive_number_value')->toArray();

        if (empty($values)) {
            return [];
        }

        $missing = [];
        $max = max($values);

        for ($i = 1; $i <= $max; $i++) {
            if (! in_array($i, $values)) {
                $missing[] = $i;
            }
        }

        return $missing;
    }
}

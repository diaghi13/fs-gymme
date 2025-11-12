<?php

namespace App\Support\Validators;

class ItalianVatNumberValidator
{
    /**
     * Validate Italian VAT number (Partita IVA)
     *
     * Format: 11 digits (IT prefix optional)
     * Algorithm: Luhn-based check digit validation
     */
    public static function validate(string $vatNumber): bool
    {
        // Remove spaces and convert to uppercase
        $vatNumber = strtoupper(str_replace(' ', '', $vatNumber));

        // Remove IT prefix if present
        if (str_starts_with($vatNumber, 'IT')) {
            $vatNumber = substr($vatNumber, 2);
        }

        // Must be exactly 11 digits
        if (! preg_match('/^\d{11}$/', $vatNumber)) {
            return false;
        }

        // First 7 digits are the company number
        // Digits 8-10 are the province code (001-100 or 120-121)
        // Digit 11 is the check digit

        // Validate check digit using algorithm
        return self::validateCheckDigit($vatNumber);
    }

    /**
     * Validate check digit (11th digit)
     */
    protected static function validateCheckDigit(string $vatNumber): bool
    {
        $sum = 0;

        // Process first 10 digits
        for ($i = 0; $i < 10; $i++) {
            $digit = (int) $vatNumber[$i];

            if ($i % 2 === 0) {
                // Even position (0-indexed): multiply by 1
                $sum += $digit;
            } else {
                // Odd position (0-indexed): multiply by 2
                $value = $digit * 2;

                // If result > 9, add digits together
                if ($value > 9) {
                    $value = ($value % 10) + 1;
                }

                $sum += $value;
            }
        }

        // Calculate check digit
        $checkDigit = (10 - ($sum % 10)) % 10;

        // Compare with actual 11th digit
        return $checkDigit === (int) $vatNumber[10];
    }

    /**
     * Format VAT number with IT prefix
     */
    public static function format(string $vatNumber): string
    {
        $vatNumber = strtoupper(str_replace(' ', '', $vatNumber));

        // Remove IT prefix if present
        if (str_starts_with($vatNumber, 'IT')) {
            $vatNumber = substr($vatNumber, 2);
        }

        return "IT{$vatNumber}";
    }

    /**
     * Extract province code from VAT number
     *
     * Digits 8-10 represent the province where the company was registered
     */
    public static function getProvinceCode(string $vatNumber): ?int
    {
        $vatNumber = strtoupper(str_replace(' ', '', $vatNumber));

        if (str_starts_with($vatNumber, 'IT')) {
            $vatNumber = substr($vatNumber, 2);
        }

        if (! self::validate($vatNumber)) {
            return null;
        }

        return (int) substr($vatNumber, 7, 3);
    }

    /**
     * Verify VAT number with VIES (VAT Information Exchange System)
     *
     * This makes an HTTP request to EU VIES service to verify
     * the VAT number is registered and active
     *
     * Note: Requires internet connection and EU VIES service availability
     */
    public static function verifyWithVIES(string $vatNumber): array
    {
        $vatNumber = strtoupper(str_replace(' ', '', $vatNumber));

        if (str_starts_with($vatNumber, 'IT')) {
            $vatNumber = substr($vatNumber, 2);
        }

        // Basic validation first
        if (! self::validate($vatNumber)) {
            return [
                'valid' => false,
                'error' => 'Invalid VAT number format',
            ];
        }

        try {
            // VIES SOAP service endpoint
            $client = new \SoapClient('https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl', [
                'exceptions' => true,
                'connection_timeout' => 10,
            ]);

            $result = $client->checkVat([
                'countryCode' => 'IT',
                'vatNumber' => $vatNumber,
            ]);

            return [
                'valid' => $result->valid,
                'name' => $result->name ?? null,
                'address' => $result->address ?? null,
                'request_date' => $result->requestDate ?? null,
            ];
        } catch (\SoapFault $e) {
            return [
                'valid' => false,
                'error' => 'VIES service unavailable: '.$e->getMessage(),
            ];
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'error' => 'Verification failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Generate a valid test VAT number for a given province code
     *
     * Useful for testing and development
     */
    public static function generateTest(int $provinceCode = 1): string
    {
        // Generate random 7-digit company number
        $companyNumber = str_pad((string) rand(1000000, 9999999), 7, '0', STR_PAD_LEFT);

        // Format province code (3 digits)
        $province = str_pad((string) $provinceCode, 3, '0', STR_PAD_LEFT);

        // Calculate check digit
        $partial = $companyNumber.$province;
        $sum = 0;

        for ($i = 0; $i < 10; $i++) {
            $digit = (int) $partial[$i];

            if ($i % 2 === 0) {
                $sum += $digit;
            } else {
                $value = $digit * 2;
                if ($value > 9) {
                    $value = ($value % 10) + 1;
                }
                $sum += $value;
            }
        }

        $checkDigit = (10 - ($sum % 10)) % 10;

        return "IT{$companyNumber}{$province}{$checkDigit}";
    }
}

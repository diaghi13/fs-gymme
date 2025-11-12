<?php

namespace App\Support\Validators;

class ItalianTaxCodeValidator
{
    /**
     * Validate Italian Tax Code (Codice Fiscale)
     *
     * Format for individuals: 16 alphanumeric characters
     * RSSMRA80A01H501U (Surname, Name, Birth Date, Birth Place, Check)
     *
     * Format for companies: 11 digits (same as VAT number)
     */
    public static function validate(string $taxCode): bool
    {
        // Remove spaces and convert to uppercase
        $taxCode = strtoupper(str_replace(' ', '', $taxCode));

        // Check length
        if (strlen($taxCode) === 11) {
            // Company tax code (same as VAT number)
            return ItalianVatNumberValidator::validate($taxCode);
        }

        if (strlen($taxCode) !== 16) {
            return false;
        }

        // Individual tax code must match pattern
        if (! preg_match('/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/', $taxCode)) {
            return false;
        }

        // Validate check character (16th character)
        return self::validateCheckCharacter($taxCode);
    }

    /**
     * Validate check character (16th character) for individual tax code
     */
    protected static function validateCheckCharacter(string $taxCode): bool
    {
        // Character value tables for odd and even positions
        $oddValues = [
            '0' => 1, '1' => 0, '2' => 5, '3' => 7, '4' => 9, '5' => 13, '6' => 15, '7' => 17, '8' => 19, '9' => 21,
            'A' => 1, 'B' => 0, 'C' => 5, 'D' => 7, 'E' => 9, 'F' => 13, 'G' => 15, 'H' => 17, 'I' => 19, 'J' => 21,
            'K' => 2, 'L' => 4, 'M' => 18, 'N' => 20, 'O' => 11, 'P' => 3, 'Q' => 6, 'R' => 8, 'S' => 12, 'T' => 14,
            'U' => 16, 'V' => 10, 'W' => 22, 'X' => 25, 'Y' => 24, 'Z' => 23,
        ];

        $evenValues = [
            '0' => 0, '1' => 1, '2' => 2, '3' => 3, '4' => 4, '5' => 5, '6' => 6, '7' => 7, '8' => 8, '9' => 9,
            'A' => 0, 'B' => 1, 'C' => 2, 'D' => 3, 'E' => 4, 'F' => 5, 'G' => 6, 'H' => 7, 'I' => 8, 'J' => 9,
            'K' => 10, 'L' => 11, 'M' => 12, 'N' => 13, 'O' => 14, 'P' => 15, 'Q' => 16, 'R' => 17, 'S' => 18, 'T' => 19,
            'U' => 20, 'V' => 21, 'W' => 22, 'X' => 23, 'Y' => 24, 'Z' => 25,
        ];

        $checkChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        $sum = 0;

        // Process first 15 characters
        for ($i = 0; $i < 15; $i++) {
            $char = $taxCode[$i];

            if ($i % 2 === 0) {
                // Odd position (1-indexed, but 0-indexed here)
                $sum += $oddValues[$char];
            } else {
                // Even position
                $sum += $evenValues[$char];
            }
        }

        // Calculate expected check character
        $expectedCheck = $checkChars[$sum % 26];

        // Compare with actual check character
        return $expectedCheck === $taxCode[15];
    }

    /**
     * Extract information from tax code
     *
     * Returns array with: surname, name, gender, birth_date, birth_place_code
     */
    public static function extract(string $taxCode): ?array
    {
        $taxCode = strtoupper(str_replace(' ', '', $taxCode));

        if (! self::validate($taxCode)) {
            return null;
        }

        // Company tax code
        if (strlen($taxCode) === 11) {
            return [
                'type' => 'company',
                'vat_number' => $taxCode,
            ];
        }

        // Individual tax code
        return [
            'type' => 'individual',
            'surname_code' => substr($taxCode, 0, 3),
            'name_code' => substr($taxCode, 3, 3),
            'birth_year' => self::extractBirthYear($taxCode),
            'birth_month' => self::extractBirthMonth($taxCode),
            'birth_day' => self::extractBirthDay($taxCode),
            'gender' => self::extractGender($taxCode),
            'birth_place_code' => substr($taxCode, 11, 4),
            'check_character' => $taxCode[15],
        ];
    }

    /**
     * Extract birth year from tax code
     */
    protected static function extractBirthYear(string $taxCode): int
    {
        $year = (int) substr($taxCode, 6, 2);
        $currentYear = (int) date('y');

        // Determine century (assume people born in 1900s if > current year + 10)
        if ($year > $currentYear + 10) {
            return 1900 + $year;
        }

        return 2000 + $year;
    }

    /**
     * Extract birth month from tax code
     */
    protected static function extractBirthMonth(string $taxCode): int
    {
        $monthChar = $taxCode[8];

        $months = [
            'A' => 1, 'B' => 2, 'C' => 3, 'D' => 4, 'E' => 5, 'H' => 6,
            'L' => 7, 'M' => 8, 'P' => 9, 'R' => 10, 'S' => 11, 'T' => 12,
        ];

        return $months[$monthChar] ?? 0;
    }

    /**
     * Extract birth day and gender from tax code
     *
     * Day is 01-31 for males, 41-71 for females
     */
    protected static function extractBirthDay(string $taxCode): int
    {
        $day = (int) substr($taxCode, 9, 2);

        // Females have 40 added to day
        if ($day > 40) {
            return $day - 40;
        }

        return $day;
    }

    /**
     * Extract gender from tax code
     */
    protected static function extractGender(string $taxCode): string
    {
        $day = (int) substr($taxCode, 9, 2);

        // Females have 40 added to birth day
        return $day > 40 ? 'F' : 'M';
    }

    /**
     * Format tax code (uppercase, no spaces)
     */
    public static function format(string $taxCode): string
    {
        return strtoupper(str_replace(' ', '', $taxCode));
    }

    /**
     * Check if tax code is for a company (11 digits) or individual (16 chars)
     */
    public static function isCompany(string $taxCode): bool
    {
        $taxCode = strtoupper(str_replace(' ', '', $taxCode));

        return strlen($taxCode) === 11 && preg_match('/^\d{11}$/', $taxCode);
    }

    /**
     * Check if tax code is for an individual (16 alphanumeric)
     */
    public static function isIndividual(string $taxCode): bool
    {
        $taxCode = strtoupper(str_replace(' ', '', $taxCode));

        return strlen($taxCode) === 16 && preg_match('/^[A-Z0-9]{16}$/', $taxCode);
    }

    /**
     * Generate surname code (first 3 characters of tax code)
     *
     * Algorithm:
     * 1. Take consonants from surname
     * 2. If not enough, use vowels
     * 3. If still not enough, pad with X
     */
    public static function generateSurnameCode(string $surname): string
    {
        $surname = strtoupper(str_replace(' ', '', $surname));

        // Extract consonants
        $consonants = preg_replace('/[AEIOU]/', '', $surname);

        // Extract vowels
        $vowels = preg_replace('/[^AEIOU]/', '', $surname);

        // Combine: consonants first, then vowels
        $code = $consonants.$vowels;

        // Take first 3 characters, pad with X if needed
        return substr(str_pad($code, 3, 'X'), 0, 3);
    }

    /**
     * Generate name code (characters 4-6 of tax code)
     *
     * Algorithm for names:
     * 1. Take 1st, 3rd, and 4th consonant if name has 4+ consonants
     * 2. Otherwise, take first 3 consonants
     * 3. If not enough, use vowels
     * 4. If still not enough, pad with X
     */
    public static function generateNameCode(string $name): string
    {
        $name = strtoupper(str_replace(' ', '', $name));

        // Extract consonants
        $consonants = preg_replace('/[AEIOU]/', '', $name);

        // Special case: 4+ consonants, use 1st, 3rd, 4th
        if (strlen($consonants) >= 4) {
            $code = $consonants[0].$consonants[2].$consonants[3];

            return $code;
        }

        // Extract vowels
        $vowels = preg_replace('/[^AEIOU]/', '', $name);

        // Combine: consonants first, then vowels
        $code = $consonants.$vowels;

        // Take first 3 characters, pad with X if needed
        return substr(str_pad($code, 3, 'X'), 0, 3);
    }

    /**
     * Generate birth date code (characters 7-11 of tax code)
     *
     * Format: YY M DD
     * - YY: last 2 digits of year
     * - M: month letter (A-T, excluding I, F, G, N, O, Q)
     * - DD: day (01-31 for males, 41-71 for females)
     */
    public static function generateBirthDateCode(string $birthDate, string $gender): string
    {
        $date = new \DateTime($birthDate);

        $year = $date->format('y');

        $monthLetters = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
        $month = $monthLetters[(int) $date->format('n') - 1];

        $day = (int) $date->format('d');

        // Add 40 for females
        if (strtoupper($gender) === 'F') {
            $day += 40;
        }

        $dayStr = str_pad((string) $day, 2, '0', STR_PAD_LEFT);

        return $year.$month.$dayStr;
    }
}

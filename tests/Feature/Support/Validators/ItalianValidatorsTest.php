<?php

use App\Support\Validators\ItalianTaxCodeValidator;
use App\Support\Validators\ItalianVatNumberValidator;

describe('ItalianVatNumberValidator', function () {
    it('validates correct VAT numbers', function () {
        // Use generated valid VAT numbers for testing
        $validVat1 = ItalianVatNumberValidator::generateTest(1);
        $validVat2 = ItalianVatNumberValidator::generateTest(100);

        expect(ItalianVatNumberValidator::validate($validVat1))->toBeTrue();
        expect(ItalianVatNumberValidator::validate($validVat2))->toBeTrue();
    });

    it('rejects invalid VAT numbers', function () {
        expect(ItalianVatNumberValidator::validate('12345678901'))->toBeFalse(); // Wrong check digit
        expect(ItalianVatNumberValidator::validate('123456789'))->toBeFalse(); // Too short
        expect(ItalianVatNumberValidator::validate('123456789012'))->toBeFalse(); // Too long
        expect(ItalianVatNumberValidator::validate('ABCDEFGHIJK'))->toBeFalse(); // Letters
    });

    it('formats VAT numbers with IT prefix', function () {
        expect(ItalianVatNumberValidator::format('12345678903'))->toBe('IT12345678903');
        expect(ItalianVatNumberValidator::format('IT12345678903'))->toBe('IT12345678903');
        expect(ItalianVatNumberValidator::format('it12345678903'))->toBe('IT12345678903');
    });

    it('extracts province code', function () {
        $provinceCode = ItalianVatNumberValidator::getProvinceCode('12345678903');
        expect($provinceCode)->toBe(890);
    });

    it('generates valid test VAT numbers', function () {
        $testVat = ItalianVatNumberValidator::generateTest(1);
        expect(ItalianVatNumberValidator::validate($testVat))->toBeTrue();

        $testVat2 = ItalianVatNumberValidator::generateTest(100);
        expect(ItalianVatNumberValidator::validate($testVat2))->toBeTrue();
    });
});

describe('ItalianTaxCodeValidator', function () {
    it('validates correct individual tax codes', function () {
        // Mario Rossi, born 01/01/1980 in Rome (H501)
        expect(ItalianTaxCodeValidator::validate('RSSMRA80A01H501U'))->toBeTrue();
    });

    it('validates company tax codes (11 digits)', function () {
        // Use generated valid VAT numbers (remove IT prefix for tax code validation)
        $validCompanyCode = str_replace('IT', '', ItalianVatNumberValidator::generateTest(1));
        expect(ItalianTaxCodeValidator::validate($validCompanyCode))->toBeTrue();
    });

    it('rejects invalid tax codes', function () {
        expect(ItalianTaxCodeValidator::validate('RSSMRA80A01H501X'))->toBeFalse(); // Wrong check
        expect(ItalianTaxCodeValidator::validate('RSSMRA80A01H50'))->toBeFalse(); // Too short
        expect(ItalianTaxCodeValidator::validate('123RSSMRA80A01H501U'))->toBeFalse(); // Too long
        expect(ItalianTaxCodeValidator::validate('1234567890'))->toBeFalse(); // Invalid 10 digits
    });

    it('formats tax codes correctly', function () {
        expect(ItalianTaxCodeValidator::format('rssmra80a01h501u'))->toBe('RSSMRA80A01H501U');
        expect(ItalianTaxCodeValidator::format(' RSS MRA 80A 01H 501U '))->toBe('RSSMRA80A01H501U');
    });

    it('identifies company vs individual tax codes', function () {
        expect(ItalianTaxCodeValidator::isCompany('12345678903'))->toBeTrue();
        expect(ItalianTaxCodeValidator::isCompany('RSSMRA80A01H501U'))->toBeFalse();

        expect(ItalianTaxCodeValidator::isIndividual('RSSMRA80A01H501U'))->toBeTrue();
        expect(ItalianTaxCodeValidator::isIndividual('12345678903'))->toBeFalse();
    });

    it('extracts information from individual tax code', function () {
        $info = ItalianTaxCodeValidator::extract('RSSMRA80A01H501U');

        expect($info)->toBeArray();
        expect($info['type'])->toBe('individual');
        expect($info['surname_code'])->toBe('RSS');
        expect($info['name_code'])->toBe('MRA');
        expect($info['birth_year'])->toBe(1980);
        expect($info['birth_month'])->toBe(1); // January (A)
        expect($info['birth_day'])->toBe(1);
        expect($info['gender'])->toBe('M');
        expect($info['birth_place_code'])->toBe('H501'); // Rome
        expect($info['check_character'])->toBe('U');
    });

    it('extracts gender correctly', function () {
        // Male: day 01
        $infoMale = ItalianTaxCodeValidator::extract('RSSMRA80A01H501U');
        expect($infoMale['gender'])->toBe('M');
        expect($infoMale['birth_day'])->toBe(1);
    });

    it('generates surname code correctly', function () {
        expect(ItalianTaxCodeValidator::generateSurnameCode('Rossi'))->toBe('RSS');
        expect(ItalianTaxCodeValidator::generateSurnameCode('Bianchi'))->toBe('BNC');
        expect(ItalianTaxCodeValidator::generateSurnameCode('Fo'))->toBe('FOX'); // Padded with X
        expect(ItalianTaxCodeValidator::generateSurnameCode('Ai'))->toBe('AIX'); // Vowels, then X
    });

    it('generates name code correctly', function () {
        expect(ItalianTaxCodeValidator::generateNameCode('Mario'))->toBe('MRA');
        expect(ItalianTaxCodeValidator::generateNameCode('Giovanni'))->toBe('GNN'); // 4+ consonants: 1st, 3rd, 4th
        expect(ItalianTaxCodeValidator::generateNameCode('Anna'))->toBe('NNA');
        expect(ItalianTaxCodeValidator::generateNameCode('Io'))->toBe('IOX'); // Not enough chars, pad with X
    });

    it('generates birth date code correctly', function () {
        // Male, 01/01/1980
        expect(ItalianTaxCodeValidator::generateBirthDateCode('1980-01-01', 'M'))->toBe('80A01');

        // Female, 01/01/1980 (day = 01 + 40 = 41)
        expect(ItalianTaxCodeValidator::generateBirthDateCode('1980-01-01', 'F'))->toBe('80A41');

        // Male, 18/12/1985
        expect(ItalianTaxCodeValidator::generateBirthDateCode('1985-12-18', 'M'))->toBe('85T18');

        // Female, 18/12/1985 (day = 18 + 40 = 58)
        expect(ItalianTaxCodeValidator::generateBirthDateCode('1985-12-18', 'F'))->toBe('85T58');
    });
});

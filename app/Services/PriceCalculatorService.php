<?php

namespace App\Services;

use Whitecube\Price\Price;

/**
 * Price Calculator Service
 * Wrapper per whitecube/php-prices per calcoli IVA precisi
 *
 * ⚠️ CONFORMITÀ FISCALE ITALIANA (DPR 633/72):
 * - Tutti i calcoli IVA seguono l'art. 21 del DPR 633/72
 * - Arrotondamenti al centesimo (€0.01) come previsto dalla normativa
 * - IVA calcolata riga per riga, poi sommata (non ricalcolata sul totale)
 * - Usa whitecube/php-prices per evitare errori di arrotondamento
 *
 * FLUSSO DEI DATI:
 * 1. DB salva in CENTESIMI (integer): 35000 = €350.00
 * 2. MoneyCast converte in EURO al get(): 350.00
 * 3. Questo service riceve CENTESIMI e ritorna EURO
 * 4. MoneyCast riconverte in CENTESIMI al set()
 */
class PriceCalculatorService
{
    /**
     * Calcola prezzo con scorporo IVA (conforme DPR 633/72)
     *
     * Input: prezzo LORDO in centesimi (IVA inclusa)
     * Output: [gross, net, vat] in EURO (float)
     *
     * ⚠️ CONFORMITÀ FISCALE:
     * - Formula scorporo IVA: Netto = Lordo / (1 + IVA%)
     * - Arrotondamento al centesimo (banker's rounding PHP)
     * - Preserva il prezzo lordo originale quando possibile
     * - IVA = Lordo - Netto (non ricalcolata con %)
     *
     * FLUSSO DATI:
     * - Input è in CENTESIMI (es: 35000 = €350.00)
     * - Output è in EURO (es: 286.89) per compatibilità con MoneyCast
     * - Il MoneyCast moltiplica per 100 al salvataggio nel DB
     */
    public static function excludeVat(
        int $grossAmountInCents,
        float $vatPercentage,
        int $quantity = 1,
        ?float $discountPercentage = null
    ): array {
        // Step 1: Calcola il prezzo NETTO unitario scorporando l'IVA
        // Formula: Netto = Lordo / (1 + VAT%)
        $vatMultiplier = 1 + ($vatPercentage / 100);
        $unitPriceNetRaw = $grossAmountInCents / $vatMultiplier;
        $unitPriceNet = (int) round($unitPriceNetRaw);

        // Step 2: Usa la libreria partendo dal NETTO per gestire sconti e quantità
        $price = Price::EUR($unitPriceNet)->setVat($vatPercentage);

        // Applica sconto se presente
        if ($discountPercentage && $discountPercentage > 0) {
            $price = $price->addModifier('discount', -$discountPercentage / 100);
        }

        // Moltiplica per quantità
        if ($quantity > 1) {
            $price = $price->setUnits($quantity);
        }

        // Step 3: Ottieni i valori finali dalla libreria (in centesimi)
        $totalNet = $price->exclusive()->getMinorAmount()->toInt();
        $totalGross = $price->inclusive()->getMinorAmount()->toInt();
        $vatAmount = $totalGross - $totalNet;

        // Step 4: IMPORTANTE - Se nessuno sconto è applicato e quantità = 1,
        // usa il grossAmountInCents ORIGINALE per evitare arrotondamenti
        if ($quantity == 1 && (! $discountPercentage || $discountPercentage == 0)) {
            $totalGross = $grossAmountInCents;
            $vatAmount = $totalGross - $totalNet;
        }

        // Step 5: CONVERTI DA CENTESIMI A EURO per compatibilità con MoneyCast
        // Il MoneyCast moltiplica per 100 al salvataggio nel DB
        return [
            'unit_price_gross' => round($grossAmountInCents / 100, 2),  // Lordo in EURO
            'unit_price_net' => round($unitPriceNet / 100, 2),          // Netto in EURO
            'total_gross' => round($totalGross / 100, 2),               // Totale lordo in EURO
            'total_net' => round($totalNet / 100, 2),                   // Totale netto in EURO
            'vat_amount' => round($vatAmount / 100, 2),                 // IVA in EURO
        ];
    }

    /**
     * Calcola prezzo con aggiunta IVA
     * Input: prezzo NETTO in centesimi (IVA esclusa)
     * Output: [net, gross, vat] in EURO (float)
     */
    public static function includeVat(
        int $netAmountInCents,
        float $vatPercentage,
        int $quantity = 1,
        ?float $discountPercentage = null
    ): array {
        // Crea prezzo netto, poi aggiungi IVA
        $price = Price::EUR($netAmountInCents)->setVat($vatPercentage);

        // Applica sconto se presente
        if ($discountPercentage && $discountPercentage > 0) {
            $price = $price->addModifier('discount', -$discountPercentage / 100);
        }

        // Moltiplica per quantità
        if ($quantity > 1) {
            $price = $price->multipliedBy($quantity);
        }

        $totalGross = $price->inclusive()->getMinorAmount()->toInt();
        $totalNet = $price->exclusive()->getMinorAmount()->toInt();
        $vatAmount = $totalGross - $totalNet;

        // CONVERTI DA CENTESIMI A EURO per compatibilità con MoneyCast
        return [
            'unit_price_net' => round($netAmountInCents / 100, 2),
            'unit_price_gross' => round($totalGross / max($quantity, 1) / 100, 2),
            'total_net' => round($totalNet / 100, 2),
            'total_gross' => round($totalGross / 100, 2),
            'vat_amount' => round($vatAmount / 100, 2),
        ];
    }

    /**
     * Calcola sconto assoluto da percentuale
     * Input: importo in centesimi
     * Output: sconto in EURO (float)
     */
    public static function calculateDiscountAmount(
        int $amountInCents,
        float $discountPercentage
    ): float {
        if ($discountPercentage <= 0) {
            return 0.0;
        }

        $discountCents = (int) round($amountInCents * ($discountPercentage / 100));

        // CONVERTI DA CENTESIMI A EURO
        return round($discountCents / 100, 2);
    }
}

<?php

namespace App\Support;

class ProductUtil
{
    public static function generateSku(string $name, int $id, string $prefix = 'PRD'): string
    {
        // Rimuovi articoli italiani
        $name = preg_replace('/\b(il|lo|la|i|gli|le|un|uno|una|dei|degli|delle|del|dello|della|dell\'|da|di|a|al|allo|alla|ai|agli|alle)\b\s*/i', '', $name);

        $words = preg_split('/\s+/', trim($name));
        $skuParts = [];

        foreach ($words as $word) {
            $consonants = [];
            $vowels = [];
            $chars = mb_str_split($word);

            foreach ($chars as $char) {
                if (preg_match('/[aeiouAEIOU]/', $char)) {
                    $vowels[] = strtoupper($char);
                } elseif (preg_match('/[a-zA-Z]/', $char)) {
                    $consonants[] = strtoupper($char);
                }
            }

            $part = '';
            $vowelIndex = 0;

            if (count($consonants) < 3 && ! empty($vowels)) {
                // Prima vocale prima delle consonanti
                $part .= $vowels[$vowelIndex++];
            }

            $part .= implode('', $consonants);

            // Se ancora meno di 3, aggiungi le vocali successive
            while (strlen($part) < 3 && $vowelIndex < count($vowels)) {
                $part .= $vowels[$vowelIndex++];
            }

            // Pad con 'X' se ancora meno di 3
            $part = str_pad(substr($part, 0, 3), 3, 'X');

            $skuParts[] = $part;
        }

        $paddedId = str_pad($id, 4, '0', STR_PAD_LEFT);

        return "{$prefix}-".implode('-', $skuParts)."-{$paddedId}";
    }

    public static function generateProductSlug(string $name, int $id): string
    {
        $slug = str($name)
            ->slug(language: 'it')
            ->toString()
            .'-'.$id;

        return $slug;
    }
}

<?php

namespace Database\Seeders\Tenant;

use App\Models\PriceList\Article;
use App\Models\PriceList\DayPass;
use App\Models\PriceList\Folder;
use App\Models\PriceList\GiftCard;
use App\Models\PriceList\Membership;
use App\Models\PriceList\Subscription;
use App\Models\PriceList\SubscriptionContent;
use App\Models\PriceList\Token;
use App\Models\Product\BaseProduct;
use App\Models\Product\CourseProduct;
use Illuminate\Database\Seeder;

class PriceListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vatRateId = 1; // Standard 22%
        $vatRateIdEsente = 151; // Standard 22%

        // ============================================
        // FOLDER 1: ABBONAMENTI
        // ============================================
        $folderAbbonamenti = Folder::create([
            'structure_id' => 1,
            'name' => 'Abbonamenti',
            'saleable' => false,
        ]);

        // Abbonamento Base - Solo Sala
        $abbBase = Subscription::create([
            'structure_id' => 1,
            'name' => 'Abbonamento Base Mensile',
            'color' => '#3B82F6',
            'saleable' => true,
            'parent_id' => $folderAbbonamenti->id,
            'description' => 'Accesso illimitato alla sala pesi e cardio',
            'selling_description' => 'Perfetto per chi vuole allenarsi in autonomia con accesso completo alla sala',
        ]);

        $abbBase->content()->saveMany([
            new SubscriptionContent([
                'price' => 45, // €45
                'vat_rate_id' => $vatRateIdEsente,
                'months_duration' => 1,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 1, // Sala Pesi e Cardio
            ]),
        ]);

        // Abbonamento Premium - Sala + Piscina + Spa
        $abbPremium = Subscription::create([
            'structure_id' => 1,
            'name' => 'Abbonamento Premium Mensile',
            'color' => '#F59E0B',
            'saleable' => true,
            'parent_id' => $folderAbbonamenti->id,
            'description' => 'Accesso completo a tutte le aree: sala, piscina, spa e area funzionale',
            'selling_description' => 'Il pacchetto completo per il tuo benessere',
        ]);

        $abbPremium->content()->saveMany([
            new SubscriptionContent([
                'price' => 75, // €75
                'vat_rate_id' => $vatRateIdEsente,
                'months_duration' => 1,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 1, // Sala Pesi
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 2, // Piscina
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 3, // Area Funzionale
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 5, // Spa & Relax
            ]),
        ]);

        // Abbonamento Studenti - Scontato
        $abbStudenti = Subscription::create([
            'structure_id' => 1,
            'name' => 'Abbonamento Studenti Mensile',
            'color' => '#10B981',
            'saleable' => true,
            'parent_id' => $folderAbbonamenti->id,
            'description' => 'Dedicato agli studenti under 26 con tessera universitaria',
            'selling_description' => 'Tariffa agevolata per studenti',
        ]);

        $abbStudenti->content()->saveMany([
            new SubscriptionContent([
                'price' => 35, // €35
                'vat_rate_id' => $vatRateIdEsente,
                'months_duration' => 1,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 1,
            ]),
        ]);

        // Abbonamento Annuale Base
        $abbAnnualeBase = Subscription::create([
            'structure_id' => 1,
            'name' => 'Abbonamento Annuale Base',
            'color' => '#8B5CF6',
            'saleable' => true,
            'parent_id' => $folderAbbonamenti->id,
            'description' => 'Abbonamento annuale alla sala con 2 mesi gratis',
            'selling_description' => 'Risparmia con l\'abbonamento annuale',
        ]);

        $abbAnnualeBase->content()->saveMany([
            new SubscriptionContent([
                'price' => 450, // €450 (€37.5/mese)
                'vat_rate_id' => $vatRateIdEsente,
                'months_duration' => 12,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 1,
            ]),
        ]);

        // Abbonamento Annuale Premium
        $abbAnnualePremium = Subscription::create([
            'structure_id' => 1,
            'name' => 'Abbonamento Annuale Premium',
            'color' => '#EC4899',
            'saleable' => true,
            'parent_id' => $folderAbbonamenti->id,
            'description' => 'Accesso completo annuale a tutte le aree',
            'selling_description' => 'Il top per chi vuole allenarsi tutto l\'anno',
        ]);

        $abbAnnualePremium->content()->saveMany([
            new SubscriptionContent([
                'price' => 750, // €750 (€62.5/mese)
                'vat_rate_id' => $vatRateIdEsente,
                'months_duration' => 12,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 1,
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 2,
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 3,
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => BaseProduct::class,
                'price_listable_id' => 5,
            ]),
        ]);

        // ============================================
        // FOLDER 2: QUOTE ASSOCIATIVE
        // ============================================
        $folderQuote = Folder::create([
            'structure_id' => 1,
            'name' => 'Quote Associative',
            'saleable' => false,
        ]);

        Membership::create([
            'structure_id' => 1,
            'name' => 'Quota Associativa Annuale 2025',
            'color' => '#2563EB',
            'saleable' => true,
            'parent_id' => $folderQuote->id,
            'price' => 50, // €50
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 12,
            'description' => 'Quota associativa annuale obbligatoria per tutti i soci',
        ]);

        // ============================================
        // FOLDER 3: INGRESSI E CARNETS
        // ============================================
        $folderIngressi = Folder::create([
            'structure_id' => 1,
            'name' => 'Ingressi e Carnets',
            'saleable' => false,
        ]);

        DayPass::create([
            'structure_id' => 1,
            'name' => 'Ingresso Giornaliero Sala',
            'color' => '#06B6D4',
            'saleable' => true,
            'parent_id' => $folderIngressi->id,
            'price' => 15, // €15
            'vat_rate_id' => $vatRateIdEsente,
            'validity_days' => 1,
            'description' => 'Accesso giornaliero alla sala pesi e cardio',
        ]);

        DayPass::create([
            'structure_id' => 1,
            'name' => 'Ingresso Giornaliero Completo',
            'color' => '#06B6D4',
            'saleable' => true,
            'parent_id' => $folderIngressi->id,
            'price' => 25, // €25
            'vat_rate_id' => $vatRateIdEsente,
            'validity_days' => 1,
            'description' => 'Accesso giornaliero a tutte le aree',
        ]);

        Token::create([
            'structure_id' => 1,
            'name' => 'Carnet 10 Ingressi Sala',
            'color' => '#14B8A6',
            'saleable' => true,
            'parent_id' => $folderIngressi->id,
            'price' => 120, // €120 (€12/ingresso)
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 3,
            'max_uses' => 10,
            'description' => 'Carnet valido 3 mesi per 10 ingressi in sala',
        ]);

        Token::create([
            'structure_id' => 1,
            'name' => 'Carnet 20 Ingressi Sala',
            'color' => '#14B8A6',
            'saleable' => true,
            'parent_id' => $folderIngressi->id,
            'price' => 200, // €200 (€10/ingresso)
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 6,
            'max_uses' => 20,
            'description' => 'Carnet valido 6 mesi per 20 ingressi in sala',
        ]);

        // ============================================
        // FOLDER 4: CORSI
        // ============================================
        $folderCorsi = Folder::create([
            'structure_id' => 1,
            'name' => 'Corsi',
            'saleable' => false,
        ]);

        // Pacchetti Spinning
        Token::create([
            'structure_id' => 1,
            'name' => 'Pacchetto 10 Lezioni Spinning',
            'color' => '#F97316',
            'saleable' => true,
            'parent_id' => $folderCorsi->id,
            'price' => 100, // €100
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 2,
            'max_uses' => 10,
            'description' => 'Pacchetto 10 lezioni di spinning valido 2 mesi',
        ]);

        // Pacchetti Yoga
        Token::create([
            'structure_id' => 1,
            'name' => 'Pacchetto 8 Lezioni Yoga',
            'color' => '#A855F7',
            'saleable' => true,
            'parent_id' => $folderCorsi->id,
            'price' => 120, // €120
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 2,
            'max_uses' => 8,
            'description' => 'Pacchetto 8 lezioni di yoga valido 2 mesi',
        ]);

        // Abbonamento Corsi Illimitati
        $abbCorsi = Subscription::create([
            'structure_id' => 1,
            'name' => 'Abbonamento Corsi Illimitati',
            'color' => '#F59E0B',
            'saleable' => true,
            'parent_id' => $folderCorsi->id,
            'description' => 'Accesso illimitato a tutti i corsi del palinsesto',
            'selling_description' => 'Partecipa a tutti i corsi senza limiti',
        ]);

        $abbCorsi->content()->saveMany([
            new SubscriptionContent([
                'price' => 65, // €65
                'vat_rate_id' => $vatRateIdEsente,
                'months_duration' => 1,
                'price_listable_type' => CourseProduct::class,
                'price_listable_id' => 6, // Spinning
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => CourseProduct::class,
                'price_listable_id' => 7, // Yoga
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => CourseProduct::class,
                'price_listable_id' => 8, // Pilates
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => CourseProduct::class,
                'price_listable_id' => 9, // Crossfit
            ]),
            new SubscriptionContent([
                'price' => 0,
                'vat_rate_id' => $vatRateIdEsente,
                'price_listable_type' => CourseProduct::class,
                'price_listable_id' => 10, // Acquagym
            ]),
        ]);

        // ============================================
        // FOLDER 5: SERVIZI
        // ============================================
        $folderServizi = Folder::create([
            'structure_id' => 1,
            'name' => 'Servizi',
            'saleable' => false,
        ]);

        // Pacchetti Personal Training
        Token::create([
            'structure_id' => 1,
            'name' => 'Pacchetto 5 Sedute PT',
            'color' => '#DC2626',
            'saleable' => true,
            'parent_id' => $folderServizi->id,
            'price' => 225, // €225 (€45/seduta)
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 2,
            'max_uses' => 5,
            'description' => 'Pacchetto 5 sedute di personal training',
        ]);

        Token::create([
            'structure_id' => 1,
            'name' => 'Pacchetto 10 Sedute PT',
            'color' => '#DC2626',
            'saleable' => true,
            'parent_id' => $folderServizi->id,
            'price' => 400, // €400 (€40/seduta)
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 3,
            'max_uses' => 10,
            'description' => 'Pacchetto 10 sedute di personal training',
        ]);

        // Pacchetti Massaggi
        Token::create([
            'structure_id' => 1,
            'name' => 'Pacchetto 3 Massaggi',
            'color' => '#0891B2',
            'saleable' => true,
            'parent_id' => $folderServizi->id,
            'price' => 135, // €135 (€45/massaggio)
            'vat_rate_id' => $vatRateIdEsente,
            'validity_months' => 3,
            'max_uses' => 3,
            'description' => 'Pacchetto 3 massaggi sportivi o relax',
        ]);

        // ============================================
        // FOLDER 6: ARTICOLI SHOP
        // ============================================
        $folderShop = Folder::create([
            'structure_id' => 1,
            'name' => 'Shop',
            'saleable' => false,
        ]);

        Article::create([
            'structure_id' => 1,
            'name' => 'Proteine Whey 1kg',
            'color' => '#737373',
            'saleable' => true,
            'parent_id' => $folderShop->id,
            'price' => 35, // €35
            'vat_rate_id' => $vatRateId,
            'description' => 'Proteine del siero del latte gusto cioccolato',
        ]);

        Article::create([
            'structure_id' => 1,
            'name' => 'Aminoacidi BCAA',
            'color' => '#737373',
            'saleable' => true,
            'parent_id' => $folderShop->id,
            'price' => 25, // €25
            'vat_rate_id' => $vatRateId,
            'description' => 'Aminoacidi ramificati 2:1:1',
        ]);

        Article::create([
            'structure_id' => 1,
            'name' => 'Tappetino Yoga',
            'color' => '#737373',
            'saleable' => true,
            'parent_id' => $folderShop->id,
            'price' => 28, // €28
            'vat_rate_id' => $vatRateId,
            'description' => 'Tappetino yoga antiscivolo 6mm',
        ]);

        Article::create([
            'structure_id' => 1,
            'name' => 'Borraccia Termica',
            'color' => '#737373',
            'saleable' => true,
            'parent_id' => $folderShop->id,
            'price' => 15, // €15
            'vat_rate_id' => $vatRateId,
            'description' => 'Borraccia termica 750ml',
        ]);

        Article::create([
            'structure_id' => 1,
            'name' => 'T-shirt Tecnica',
            'color' => '#737373',
            'saleable' => true,
            'parent_id' => $folderShop->id,
            'price' => 20, // €20
            'vat_rate_id' => $vatRateId,
            'description' => 'Maglietta tecnica traspirante',
        ]);

        // ============================================
        // FOLDER 7: GIFT CARD
        // ============================================
        $folderGift = Folder::create([
            'structure_id' => 1,
            'name' => 'Buoni Regalo',
            'saleable' => false,
        ]);

        GiftCard::create([
            'structure_id' => 1,
            'name' => 'Buono Regalo €50',
            'color' => '#BE185D',
            'saleable' => true,
            'parent_id' => $folderGift->id,
            'price' => 50,
            'vat_rate_id' => $vatRateId,
            'validity_months' => 12,
            'description' => 'Buono regalo del valore di €50 valido 12 mesi',
        ]);

        GiftCard::create([
            'structure_id' => 1,
            'name' => 'Buono Regalo €100',
            'color' => '#BE185D',
            'saleable' => true,
            'parent_id' => $folderGift->id,
            'price' => 100,
            'vat_rate_id' => $vatRateId,
            'validity_months' => 12,
            'description' => 'Buono regalo del valore di €100 valido 12 mesi',
        ]);

        GiftCard::create([
            'structure_id' => 1,
            'name' => 'Buono Regalo €200',
            'color' => '#BE185D',
            'saleable' => true,
            'parent_id' => $folderGift->id,
            'price' => 200,
            'vat_rate_id' => $vatRateId,
            'validity_months' => 12,
            'description' => 'Buono regalo del valore di €200 valido 12 mesi',
        ]);
    }
}

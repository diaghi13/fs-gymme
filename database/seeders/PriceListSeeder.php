<?php

namespace Database\Seeders;

use App\Models\PriceList\Article;
use App\Models\PriceList\Folder;
use App\Models\PriceList\Membership;
use App\Models\PriceList\Subscription;
use App\Models\PriceList\SubscriptionContent;
use App\Models\Product\BaseProduct;
use App\Support\Color;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PriceListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $folder = Folder::create([
            'structure_id' => 1,
            'name' => 'Folder 1',
            'saleable' => true,
        ]);

        $article1 = Article::create([
            'structure_id' => 1,
            'name' => 'Article 1',
            'color' => Color::randomHex(),
            'saleable' => true,
            'parent_id' => $folder->id,
            'price' => 12,
            'vat_rate_id' => 1,
        ]);

        $article2 = Article::create([
            'structure_id' => 1,
            'name' => 'Article 2',
            'color' => Color::randomHex(),
            'saleable' => true,
            'parent_id' => $folder->id,
            'price' => 10,
            'vat_rate_id' => 1,
        ]);

        $membershipFee = Membership::create([
            'structure_id' => 1,
            'name' => 'Membership Fee',
            'color' => Color::randomHex(),
            'saleable' => true,
            'parent_id' => $folder->id,
            'price' => 35,
            'vat_rate_id' => 1,
            'months_duration' => 12,
        ]);

        $subscription = Subscription::create([
            'structure_id' => 1,
            'name' => 'Subscription 1',
            'color' => Color::randomHex(),
            'saleable' => true,
            'parent_id' => $folder->id,
        ]);

        $content1 = new SubscriptionContent([
            'price' => 35,
            'vat_rate_id' => 1,
            'months_duration' => 12,
        ]);

        $content1->price_listable()->associate($membershipFee);

        $content2 = new SubscriptionContent([
            'price' => 300,
            'vat_rate_id' => 1,
            'months_duration' => 12,
        ]);

        $content2->price_listable()->associate(BaseProduct::find(1));

        $subscription->content()->saveMany([$content1, $content2]);
    }
}

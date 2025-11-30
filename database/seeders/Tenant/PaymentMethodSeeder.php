<?php

namespace Database\Seeders\Tenant;

use App\Models\Support\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $string = file_get_contents(base_path().'/payment-methods-dataset.json');
        $json_a = json_decode($string);

        $collection = collect($json_a);

        $collection->map(function ($item) {
            /** @var $paymentMethod PaymentMethod*/
            if ($item->ModalitaPagamentoCodice !== null) {
                $paymentMethod = PaymentMethod::updateOrCreate([
                    'code' => $item->ModalitaPagamentoCodice,
                ], [
                    'description' => $item->ModalitaPagamento,
                    'code' => $item->ModalitaPagamentoCodice,
                ]);

                $paymentMethod->payment_conditions()->save(
                    new \App\Models\Support\PaymentCondition([
                        'description' => $item->Descrizione,
                    ])
                );
            } else {
                $paymentCondition = \App\Models\Support\PaymentCondition::Create([
                    'description' => $item->Descrizione,
                ]);
            }
        });
    }
}

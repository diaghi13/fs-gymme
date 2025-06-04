<?php

namespace Database\Seeders;

use App\Models\VatRate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VatRateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $string = file_get_contents(base_path().'/vats-dataset.json');
        $json_a = json_decode($string);

        $collection = collect($json_a);

        $vatRateTypes = [];

        $collection->map(function ($item) use ($collection, &$vatRateTypes) {
            if (!array_key_exists('TipoCodiceIvaId', $vatRateTypes)) {
                $vatRateTypes[$item->TipoCodiceIvaId] = [
                    'id' => $item->TipoCodiceIvaId,
                    'type' => $item->TipoCodiceIva,
                ];
            }
        });

        $vatRateGroups = [];

        $collection->map(function ($item) use ($collection, &$vatRateGroups) {
            if (!array_key_exists('GruppoCodiceIvaId', $vatRateGroups)) {
                $vatRateGroups[$item->GruppoCodiceIvaId] = [
                    'id' => $item->GruppoCodiceIvaId,
                    'group' => $item->GruppoCodiceIva,
                ];
            }
        });

        $vatRateTypes = DB::table('vat_rate_types')->insert(array_values($vatRateTypes));
        $vatRateGroups = DB::table('vat_rate_groups')->insert(array_values($vatRateGroups));

        $collection->map(function ($item) use ($vatRateTypes, $vatRateGroups) {
            $vatRate = new VatRate();
            $vatRate->code = $item->Codice;
            $vatRate->description = $item->Descrizione;
            $vatRate->percentage = $item->Percentuale;
            $vatRate->order = $item->Ordine;
            $vatRate->nature = $item->Natura;
            $vatRate->visible_in_activity = $item->VisibileInAttivita;
            $vatRate->checkout_application = $item->ApplicaCasse;
            $vatRate->withholding_tax_application = $item->ApplicaRitenutaAcconto;
            $vatRate->social_security_withholding_application = $item->ApplicaRitenutaPrevidenziale;

            if ($item->TipoCodiceIvaId) {
                $vatRate->vat_rate_type_id = $item->TipoCodiceIvaId;
            }

            if ($item->GruppoCodiceIvaId) {
                $vatRate->vat_rate_group_id = $item->GruppoCodiceIvaId;
            }

            return $vatRate->save();
        });
    }
}

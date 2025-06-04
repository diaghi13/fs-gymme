<?php

namespace Database\Seeders;

use App\Models\Support\DocumentTypeElectronicInvoice;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $string = file_get_contents(base_path().'/document-types-dataset.json');
        $json_a = json_decode($string);

        $collection = collect($json_a);

        $collection->map(function ($item) {
            $documentTypeGroup = \App\Models\Support\DocumentTypeGroup::updateOrCreate([
                'name' => $item->GruppoTipoDocumento,
            ], [
                'name' => $item->GruppoTipoDocumento,
            ]);

            $documentTypeGroup->document_types()->save(
                new \App\Models\Support\DocumentType([
                    'name' => $item->TipoDocumento,
                    'description' => $item->Descrizione,
                    'accountable' => $item->Contabilizzabile,
                    'order' => $item->Ordinamento,
                ])
            );
        });

        $string = file_get_contents(base_path().'/document-types-fe-dataset.json');
        $json_a = json_decode($string);

        $collection = collect($json_a);

        $collection->map(function ($item) {
            $documentTypeEI = DocumentTypeElectronicInvoice::create([
                'code' => $item->Codice,
                'description' => $item->Descrizione,
                'can_invoice_himself' => $item->PuoFatturareASeStesso,
            ]);

            $documentType = \App\Models\Support\DocumentType::where('name', $item->TipoDocumento)->first();
            if ($documentType) {
                $documentTypeEI->document_type()->associate($documentType);
                $documentTypeEI->save();
            }
        });
    }
}

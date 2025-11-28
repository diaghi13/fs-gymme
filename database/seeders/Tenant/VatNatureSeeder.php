<?php

namespace Database\Seeders\Tenant;

use App\Models\VatNature;
use Illuminate\Database\Seeder;

class VatNatureSeeder extends Seeder
{
    /**
     * Seed all Italian VAT natures according to FatturaPA specifications
     *
     * @see https://www.agenziaentrate.gov.it/portale/documents/20143/233439/Natura_operazione.pdf
     */
    public function run(): void
    {
        $natures = [
            // N1 - Escluse ex art. 15
            [
                'code' => 'N1',
                'parent_code' => null,
                'description' => 'Escluse ex art. 15',
                'usage_notes' => 'Operazioni escluse dal campo di applicazione dell\'IVA ai sensi dell\'art. 15 del DPR 633/72. Include: servizi di trasporto urbano, cessioni di denaro o crediti, operazioni assicurative.',
                'requires_document_reference' => false,
                'order' => 1,
            ],

            // N2 - Non soggette
            [
                'code' => 'N2',
                'parent_code' => null,
                'description' => 'Non soggette',
                'usage_notes' => 'Operazioni non soggette ad IVA. Utilizzare i sotto-codici N2.1 e N2.2 quando possibile per maggiore precisione.',
                'requires_document_reference' => false,
                'order' => 2,
            ],
            [
                'code' => 'N2.1',
                'parent_code' => 'N2',
                'description' => 'Non soggette ad IVA ai sensi degli artt. da 7 a 7-septies del DPR 633/72',
                'usage_notes' => 'Include: cessioni all\'esportazione, servizi internazionali, operazioni con organismi internazionali. Da preferire a N2 quando applicabile.',
                'requires_document_reference' => false,
                'order' => 3,
            ],
            [
                'code' => 'N2.2',
                'parent_code' => 'N2',
                'description' => 'Non soggette - altri casi',
                'usage_notes' => 'Altre operazioni non soggette ad IVA non rientranti in N2.1. Include: cessioni a non residenti, operazioni fuori campo IVA territoriale.',
                'requires_document_reference' => false,
                'order' => 4,
            ],

            // N3 - Non imponibili
            [
                'code' => 'N3',
                'parent_code' => null,
                'description' => 'Non imponibili',
                'usage_notes' => 'Operazioni non imponibili IVA. Utilizzare i sotto-codici N3.1-N3.6 per specificare il tipo esatto di operazione non imponibile.',
                'requires_document_reference' => false,
                'order' => 5,
            ],
            [
                'code' => 'N3.1',
                'parent_code' => 'N3',
                'description' => 'Non imponibili - esportazioni',
                'usage_notes' => 'Cessioni all\'esportazione ex art. 8, primo comma, lettere a) e b), DPR 633/72. Include vendite a clienti extra-UE con prova di uscita merci dal territorio doganale.',
                'requires_document_reference' => false,
                'order' => 6,
            ],
            [
                'code' => 'N3.2',
                'parent_code' => 'N3',
                'description' => 'Non imponibili - cessioni intracomunitarie',
                'usage_notes' => 'Cessioni intracomunitarie di beni ex art. 41, DL 331/93. Richiede partita IVA comunitaria valida del cessionario e prova trasporto intra-UE.',
                'requires_document_reference' => false,
                'order' => 7,
            ],
            [
                'code' => 'N3.3',
                'parent_code' => 'N3',
                'description' => 'Non imponibili - cessioni verso San Marino',
                'usage_notes' => 'Cessioni verso la Repubblica di San Marino ex art. 71, DPR 633/72 e DM 24/12/93. Richiede specifiche condizioni documentali.',
                'requires_document_reference' => false,
                'order' => 8,
            ],
            [
                'code' => 'N3.4',
                'parent_code' => 'N3',
                'description' => 'Non imponibili - operazioni assimilate alle cessioni all\'esportazione',
                'usage_notes' => 'Operazioni assimilate alle cessioni all\'esportazione ex art. 8-bis, DPR 633/72. Include cessioni a esportatori abituali, depositi IVA.',
                'requires_document_reference' => false,
                'order' => 9,
            ],
            [
                'code' => 'N3.5',
                'parent_code' => 'N3',
                'description' => 'Non imponibili - a seguito di dichiarazioni d\'intento',
                'usage_notes' => 'Cessioni a esportatori abituali che hanno presentato dichiarazione d\'intento. Verificare validità e massimale della dichiarazione d\'intento.',
                'requires_document_reference' => true,
                'order' => 10,
            ],
            [
                'code' => 'N3.6',
                'parent_code' => 'N3',
                'description' => 'Non imponibili - altre operazioni che non concorrono alla formazione del plafond',
                'usage_notes' => 'Altre operazioni non imponibili diverse da quelle sopra indicate. Include operazioni triangolari, servizi internazionali non imponibili.',
                'requires_document_reference' => false,
                'order' => 11,
            ],

            // N4 - Esenti
            [
                'code' => 'N4',
                'parent_code' => null,
                'description' => 'Esenti',
                'usage_notes' => 'Operazioni esenti da IVA ai sensi dell\'art. 10 del DPR 633/72. Include: prestazioni sanitarie, educative, attività sportive dilettantistiche, servizi bancari e assicurativi. Palestre: verificare requisiti per esenzione attività sportive.',
                'requires_document_reference' => false,
                'order' => 12,
            ],

            // N5 - Regime del margine
            [
                'code' => 'N5',
                'parent_code' => null,
                'description' => 'Regime del margine / IVA non esposta in fattura',
                'usage_notes' => 'Regime speciale per beni usati, oggetti d\'arte, antiquariato e da collezione ex art. 36 e seguenti, DL 41/95. L\'IVA è calcolata sul margine e non esposta in fattura. Raro per palestre.',
                'requires_document_reference' => false,
                'order' => 13,
            ],

            // N6 - Inversione contabile (reverse charge)
            [
                'code' => 'N6',
                'parent_code' => null,
                'description' => 'Inversione contabile (reverse charge)',
                'usage_notes' => 'Operazioni con inversione contabile (reverse charge). Utilizzare i sotto-codici N6.1-N6.9 per specificare il tipo di operazione. L\'IVA è a carico del cessionario/committente.',
                'requires_document_reference' => false,
                'order' => 14,
            ],
            [
                'code' => 'N6.1',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - cessione di rottami e altri materiali di recupero',
                'usage_notes' => 'Cessioni di rottami, cascami e avanzi di metalli ferrosi e non ferrosi ex art. 74, commi 7 e 8, DPR 633/72.',
                'requires_document_reference' => false,
                'order' => 15,
            ],
            [
                'code' => 'N6.2',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - cessione di oro e argento puro',
                'usage_notes' => 'Cessioni di oro industriale, argento puro e altri materiali preziosi ex art. 17, comma 5, DPR 633/72.',
                'requires_document_reference' => false,
                'order' => 16,
            ],
            [
                'code' => 'N6.3',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - subappalto nel settore edile',
                'usage_notes' => 'Prestazioni di servizi di subappalto nel settore edile ex art. 17, comma 6, lett. a), DPR 633/72. Applicabile a palestre per lavori di ristrutturazione/manutenzione.',
                'requires_document_reference' => false,
                'order' => 17,
            ],
            [
                'code' => 'N6.4',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - cessione di fabbricati',
                'usage_notes' => 'Cessioni di fabbricati o porzioni di fabbricato ex art. 17, comma 6, lett. a-bis), DPR 633/72. Applicabile solo a specifiche cessioni immobiliari.',
                'requires_document_reference' => false,
                'order' => 18,
            ],
            [
                'code' => 'N6.5',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - cessione di telefoni cellulari',
                'usage_notes' => 'Cessioni di telefoni cellulari ex art. 17, comma 6, lett. b), DPR 633/72. Raro per palestre.',
                'requires_document_reference' => false,
                'order' => 19,
            ],
            [
                'code' => 'N6.6',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - cessione di prodotti elettronici',
                'usage_notes' => 'Cessioni di console da gioco, tablet PC e laptop ex art. 17, comma 6, lett. b-bis), DPR 633/72. Raro per palestre.',
                'requires_document_reference' => false,
                'order' => 20,
            ],
            [
                'code' => 'N6.7',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - prestazioni comparto edile e settori connessi',
                'usage_notes' => 'Prestazioni di servizi nel settore edile e settori connessi ex art. 17, comma 6, lett. a-ter), DPR 633/72. Applicabile per lavori di costruzione/ristrutturazione palestra.',
                'requires_document_reference' => false,
                'order' => 21,
            ],
            [
                'code' => 'N6.8',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - operazioni settore energetico',
                'usage_notes' => 'Operazioni nel settore energetico (gas, energia elettrica) ex art. 17, comma 6, lett. a-quater) e quinquies), DPR 633/72.',
                'requires_document_reference' => false,
                'order' => 22,
            ],
            [
                'code' => 'N6.9',
                'parent_code' => 'N6',
                'description' => 'Inversione contabile - altri casi',
                'usage_notes' => 'Altri casi di inversione contabile non specificati sopra. Utilizzare solo se nessuna delle altre categorie N6.x è applicabile. Specificare sempre il riferimento normativo.',
                'requires_document_reference' => true,
                'order' => 23,
            ],

            // N7 - IVA assolta in altro stato UE
            [
                'code' => 'N7',
                'parent_code' => null,
                'description' => 'IVA assolta in altro stato UE',
                'usage_notes' => 'Operazioni per le quali l\'IVA è stata assolta in altro Stato membro UE (regime OSS/IOSS). Include vendite e-commerce B2C intra-UE. Raro per palestre.',
                'requires_document_reference' => false,
                'order' => 24,
            ],
        ];

        // Insert all natures
        foreach ($natures as $nature) {
            VatNature::create($nature);
        }
    }
}

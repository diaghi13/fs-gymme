<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('structure_id')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->unsignedBigInteger('sale_id')->nullable();
            $table->unsignedBigInteger('document_type_electronic_invoice_id');


            $table->string('tipo_documento', 4)->default('TD01'); // es: TD01=Fattura
            $table->string('divisa', 3)->default('EUR');
            $table->string('invoice_number', 50)->unique();
            $table->date('invoice_date');
            $table->string('codice_destinatario', 7)->nullable();
            $table->string('billing_name', 255);
            $table->text('billing_address')->nullable();
            $table->string('billing_city', 100)->nullable();
            $table->string('billing_postal_code', 20)->nullable();
            $table->string('billing_country', 100)->nullable();
            $table->string('billing_vat_number', 50)->nullable();
            $table->string('billing_tax_code', 50)->nullable();
            $table->string('billing_sdi_code', 10)->nullable();
            $table->string('billing_pec', 255)->nullable();
            $table->integer('subtotal'); // centesimi
            $table->integer('tax_amount'); // centesimi
            $table->integer('total_amount'); // centesimi
            $table->json('bollo')->nullable(); // centesimi
            $table->integer('ritenuta_acconto')->nullable(); // centesimi
            $table->integer('cassa_previdenziale')->nullable(); // centesimi
            $table->integer('arrotondamento')->nullable(); // centesimi
            $table->enum('fe_status', ['draft', 'sent', 'delivered', 'accepted', 'rejected', 'error'])->default('draft');
            $table->string('fe_filename', 255)->nullable();
            $table->timestamp('fe_sent_at')->nullable();
            $table->text('fe_response')->nullable();
            $table->enum('payment_status', ['unpaid', 'paid', 'partially_paid', 'overdue'])->default('unpaid');
            $table->string('payment_method', 50)->nullable();
            $table->date('payment_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('order_reference', 50)->nullable();
            $table->string('ddt_reference', 50)->nullable();
            $table->string('attachment_xml', 255)->nullable();
            $table->string('attachment_pdf', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('structure_id')
                ->references('id')
                ->on('structures')
                ->nullOnDelete();
            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->nullOnDelete();
            $table->foreign('sale_id')
                ->references('id')
                ->on('sales')
                ->nullOnDelete();
            $table->foreign('document_type_electronic_invoice_id')
                ->references('id')
                ->on('document_type_electronic_invoices');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_installments');
        Schema::dropIfExists('documents');
    }

    public function fatturaElettronicaHeader(Blueprint $table): void
    {
        $this->datiTrasmissione($table);

        $this->cedentePrestatore($table);

        $this->rappresentanteFiscale($table);

        $this->cessionarioCommittente($table);

        $this->terzoIntermediarioOSoggettoEmittente($table);

        $this->soggettoEmittente($table);
    }

    public function datiTrasmissione(Blueprint $table): void
    {
        // <IdTrasmittente>
        $table->string('id_paese', 2)->default('IT'); // Paese del trasmittente, es: IT
        $table->string('id_codice', 28)->default('0000000'); // Codice del trasmittente, es: 0000000
        $table->string('progressivo_invio', 10)->default('0000000001'); // Progressivo invio del documento, es: 0000000001
        $table->string('formato_trasmissione', 5)->default('FPR12'); // Formato di trasmissione, es: FPA12 (FatturaPA versione 1.2). FPR12 7 caratteri in codice destinatario FPA12 6 caratteri in codice destinatario
        $table->string('codice_destinatario', 7)->default('0000000'); // Codice destinatario del trasmittente, es: 0000000

        // <ContattiTrasmittente> nullable
        $table->string('telefono', 12)->nullable(); // Telefono del trasmittente, es: 1234567890
        $table->string('email', 256)->nullable(); // Email del trasmittente, es:

        $table->string('pec_destinatario', 256)->nullable(); // PEC del trasmittente, es:
    }

    public function cedentePrestatore(Blueprint $table): void
    {
        // <CedentePrestatore>
// <DatiAnagrafici>
// <IdFiscaleIVA>
        $table->string('cp_id_paese', 2)->default('IT'); // Paese del cedente prestatore, es: IT
        $table->string('cp_id_codice', 28)->default('0000000'); // Codice del cedente prestatore, es: 0000000 PIVA o CF
// </IdFiscaleIVA>
        $table->string('cp_codice_fiscale', 16)->nullable(); // Codice fiscale del cedente prestatore, es: 00000000000 PIVA o CF
// <Anagrafica> obbligatorio
        $table->string('cp_denominazione', 80)->nullable(); // Denominazione del cedente prestatore, es: Nome Azienda
        $table->string('cp_nome', 60)->nullable(); // Nome del cedente prestatore, es: Mario
        $table->string('cp_cognome', 60)->nullable(); // Cognome del cedente prestatore, es: Rossi
        $table->string('cp_titolo', 10)->nullable(); // Titolo del cedente prestatore, es: Sig.
        $table->string('cp_cod_eroi', 17)->nullable(); // Codice EROI del cedente prestatore, es: 1234567890
// </Anagrafica>
        $table->string('cp_albo_professionale', 60)->nullable(); // Albo professionale del cedente prestatore, es: Ordine degli Avvocati
        $table->string('cp_provincia_albo', 2)->nullable(); // Provincia dell'albo professionale, es: RM)
        $table->string('cp_numero_iscrizione_albo', 60)->nullable(); // Numero di iscrizione all'albo professionale, es: 123456)
        $table->date('cp_data_iscrizione_albo')->nullable(); // Data di iscrizione all'albo professionale, es: 2023-01-01)
        $table->string('cp_regime_fiscale', 2); // Regime fiscale del cedente prestatore, es: RF01 (Ordinario), RF02 (Forfettario), RF03 (Minimi), RF04 (Agricolo), RF05 (IVA non applicabile), RF06 (IVA assolta in altro stato membro)
// </DatiAnagrafici>
// <Sede>
        $table->string('cp_indirizzo', 60); // Indirizzo del cedente prestatore, es: Via Roma 1
        $table->string('cp_numero_civico', 8)->nullable(); // Numero civico del cedente prestatore, es: 1
        $table->string('cp_cap', 5); // CAP del cedente prestatore, es: 00100
        $table->string('cp_comune', 60); // Comune del cedente prestatore, es: Roma
        $table->string('cp_provincia', 2)->nullable(); // Provincia del cedente prestatore, es: RM
        $table->string('cp_nazione', 2)->default('IT'); // Nazione del cedente prestatore, es: IT
// </Sede>
// <StabileOrganizzazione> nullable
        $table->string('cp_indirizzo_stab_org', 60)->nullable(); // Indirizzo della stabile organizzazione, es: Via Milano 2
        $table->string('cp_numero_civico_stab_org', 8)->nullable(); // Numero civico della stabile organizzazione, es: 2
        $table->string('cp_cap_stab_org', 5)->nullable(); // CAP della stabile organizzazione, es: 00100
        $table->string('cp_comune_stab_org', 60)->nullable(); // Comune della stabile organizzazione, es: Milano
        $table->string('cp_provincia_stab_org', 2)->nullable(); // Provincia della stabile organizzazione, es: MI
        $table->string('cp_nazione_stab_org', 2)->nullable(); // Nazione della stabile organizzazione, es: IT
// </StabileOrganizzazione>
// <IscrizioneRea> nullable
        $table->string('cp_ufficio', 2)->nullable(); // Ufficio REA del cedente prestatore, es: RM
        $table->string('cp_numero_rea', 20)->nullable(); // Numero REA del cedente prestatore, es: RM-123456
        $table->string('cp_capitale_sociale', 15)->nullable(); // Capitale sociale del cedente prestatore, es: 10000
        $table->string('cp_socio_unico', 2)->nullable(); // Socio unico del cedente prestatore, es: SU (socio unico), SM (più soci)
        $table->string('cp_stato_liquidazione', 2)->nullable(); // Stato di liquidazione del cedente prestatore, es: LS (in liquidazione), LN (non in liquidazione)
// </IscrizioneRea>
// <Contatti> nullable
        $table->string('cp_telefono', 12)->nullable(); // Telefono del cedente prestatore, es: 1234567890
        $table->string('cp_fax', 12)->nullable(); // Fax del cedente prestatore, es: 0987654321
        $table->string('cp_email', 256)->nullable(); // Email del cedente prestatore, es:
// </Contatti>
        $table->string('cp_riferimento_amministrazione', 20)->nullable(); // Riferimento amministrazione del cedente prestatore, es: 123456
// </CedentePrestatore>
    }

    public function rappresentanteFiscale(Blueprint $table): void
    {
        // <RappresentanteFiscale> nullable
        $table->string('rf_id_paese', 2)->nullable(); // Paese del rappresentante fiscale, es: IT
        $table->string('rf_id_codice', 28)->nullable(); // Codice del rappresentante fiscale, es: 0000000 PIVA o CF
        $table->string('rf_codice_fiscale', 16)->nullable(); // Codice fiscale del rappresentante fiscale, es: 00000000000 PIVA o CF
        $table->string('rf_denominazione', 80)->nullable(); // Denominazione del rappresentante fiscale, es: Nome Azienda
        $table->string('rf_nome', 60)->nullable(); // Nome del rappresentante fiscale, es: Mario
        $table->string('rf_cognome', 60)->nullable(); // Cognome del rappresentante fiscale, es: Rossi
        $table->string('rf_titolo', 10)->nullable(); // Titolo del rappresentante fiscale, es: Sig.
        $table->string('rf_cod_eroi', 17)->nullable(); // Codice EROI del rappresentante fiscale, es: 1234567890
    }

    public function cessionarioCommittente(Blueprint $table): void
    {
        // <CessionarioCommittente>
        $table->string('cc_id_paese', 2)->nullable(); // Paese del cessionario committente, es: IT
        $table->string('cc_id_codice', 28)->nullable(); // Codice del cessionario committente, es: 0000000 PIVA o CF
        $table->string('cc_codice_fiscale', 16)->nullable(); // Codice fiscale del cessionario committente, es: 00000000000 PIVA o CF
        $table->string('cc_denominazione', 80)->nullable(); // Denominazione del cessionario committente, es: Nome Azienda
        $table->string('cc_nome', 60)->nullable(); // Nome del cessionario committente, es: Mario
        $table->string('cc_cognome', 60)->nullable(); // Cognome del cessionario committente, es: Rossi
        $table->string('cc_titolo', 10)->nullable(); // Titolo del cessionario committente, es: Sig.
        $table->string('cc_cod_eroi', 17)->nullable(); // Codice EROI del cessionario committente, es: 1234567890
        // <Sede>
        $table->string('cc_indirizzo', 60); // Indirizzo del cessionario committente, es: Via Roma 1
        $table->string('cc_numero_civico', 8)->nullable(); // Numero civico del cessionario committente, es: 1
        $table->string('cc_cap', 5); // CAP del cessionario committente, es: 00100
        $table->string('cc_comune', 60); // Comune del cessionario committente, es: Roma
        $table->string('cc_provincia', 2)->nullable(); // Provincia del cessionario committente, es: RM
        $table->string('cc_nazione', 2)->default('IT'); // Nazione del cessionario committente, es: IT
        // </Sede>
        // <StabileOrganizzazione> nullable
        $table->string('cc_indirizzo_stab_org', 60)->nullable(); // Indirizzo della stabile organizzazione, es: Via Milano 2
        $table->string('cc_numero_civico_stab_org', 8)->nullable(); // Numero civico della stabile organizzazione, es: 2
        $table->string('cc_cap_stab_org', 5)->nullable(); // CAP della stabile organizzazione, es: 00100
        $table->string('cc_comune_stab_org', 60)->nullable(); // Comune della stabile organizzazione, es: Milano
        $table->string('cc_provincia_stab_org', 2)->nullable(); // Provincia della stabile organizzazione, es: MI
        $table->string('cc_nazione_stab_org', 2)->nullable(); // Nazione della stabile organizzazione, es: IT
        // </StabileOrganizzazione>
        // <RappresentanteFiscale> nullable
        $table->string('cc_rf_id_paese', 2)->nullable(); // Paese del rappresentante fiscale del cessionario committente, es: IT
        $table->string('cc_rf_id_codice', 28)->nullable(); // Codice del rappresentante fiscale del cessionario committente, es: 0000000 PIVA o CF
        $table->string('cc_rf_denominazione', 80)->nullable(); // Denominazione del rappresentante fiscale del cessionario committente, es: Nome Azienda
        $table->string('cc_rf_nome', 60)->nullable(); // Nome del rappresentante fiscale del cessionario committente, es: Mario
        $table->string('cc_rf_cognome', 60)->nullable(); // Cognome del rappresentante fiscale del cessionario committente, es: Rossi
        // </RappresentanteFiscale>
    }

    public function terzoIntermediarioOSoggettoEmittente(Blueprint $table): void
    {
        // <TerzoIntermediarioOSoggettoEmittente> nullable
        $table->string('ti_id_paese', 2)->nullable(); // Paese del terzo intermediario o soggetto emittente, es: IT
        $table->string('ti_id_codice', 28)->nullable(); // Codice del terzo intermediario o soggetto emittente, es: 0000000 PIVA o CF
        $table->string('ti_codice_fiscale', 16)->nullable(); // Codice fiscale del terzo intermediario o soggetto emittente, es: 00000000000 PIVA o CF
        $table->string('ti_denominazione', 80)->nullable(); // Denominazione del terzo intermediario o soggetto emittente, es: Nome Azienda
        $table->string('ti_nome', 60)->nullable(); // Nome del terzo intermediario o soggetto emittente, es: Mario
        $table->string('ti_cognome', 60)->nullable(); // Cognome del terzo intermediario o soggetto emittente, es: Rossi
        $table->string('ti_titolo', 10)->nullable(); // Titolo del terzo intermediario o soggetto emittente, es: Sig.
        $table->string('ti_cod_eroi', 17)->nullable(); // Codice EROI del terzo intermediario o soggetto emittente, es: 1234567890
    }

    public function soggettoEmittente(Blueprint $table): void
    {
        $table->string('soggetto_emittente', 2)->nullable(); // Soggetto emittente del documento, es: CC (Cessionario Committente), TZ (Terzo Intermediario o Soggetto Emittente)
    }

    public function fatturaElettronicaBody(Blueprint $table): void
    {
        $this->datiGeneraliDocumento($table);

        // Dati ordine acquisto relazione

        // Dati contratto relazione come ordine acquisto

        // Dati convenzione relazione come ordine acquisto

        // Dati ricezione relazione come ordine acquisto

        // Dati fatture collegate relazione come ordine acquisto

        // Dati SAL relazione

        // Dati DDT relazioneù

        $this->datiTrasporto($table);

        // Dati beni e servizi

        // Dettaglio linee relazione

        $this->datiVeicoli($table);

        $this->datiPagamento($table);

        // Dettagli pagamento relazione

        $this->allegati($table);
    }

    public function datiGeneraliDocumento(Blueprint $table): void
    {

        $table->string('dgd_tipo_documento', 4)->default('TD01'); // Tipo documento, es: TD01 (Fattura)
        $table->string('dgd_divisa', 3)->default('EUR'); // Divisa, es: EUR
        $table->date('dgd_data'); // Data documento, es: 2023-01-01
        $table->string('dgd_numero', 20)->unique(); // Numero documento, es: 123456
        // Dati ritenuta d'acconto relazione
        $table->string('dgd_bollo_virtuale', 2)->nullable(); // Bollo virtuale, ammesso: SI (Sì)
        $table->integer('dgd_importo_bollo', 15)->nullable(); // Importo del bollo virtuale, es: 200
        // Dati cassa previdenziale relazione
        // Sconto maggiore relazione
        $table->integer('dgd_importo_totale_documento', 15)->nullable(); // Importo totale documento, es: 10000
        $table->integer('dgd_arrotondamento', 15)->nullable(); // Arrotondamento, es: 100
        $table->integer('dgd_causale', 200)->nullable(); // Causale del documento, es: Vendita prodotti e servizi ? Relazione?
        $table->string('gdg_art_73', 2)->nullable(); // Articolo 73, ammesso: S (Sì) documento emesso secondo modalità e termini stabiliti con DM ai sensi dell'art. 73 DPR 633/72
    }

    public function datiTrasporto(Blueprint $table): void
    {
        // <DatiAnagraficiVettore>
        $table->string('dtv_id_paese', 2)->nullable(); // Paese del vettore, es: IT
        $table->string('dtv_id_codice', 28)->nullable(); // Codice del vettore, es: 0000000 PIVA o CF
        $table->string('dtv_codice_fiscale', 16)->nullable(); // Codice fiscale del vettore, es: 00000000000 PIVA o CF
        $table->string('dtv_denominazione', 80)->nullable(); // Denominazione del vettore, es: Nome Azienda
        $table->string('dtv_nome', 60)->nullable(); // Nome del vettore, es: Mario
        $table->string('dtv_cognome', 60)->nullable(); // Cognome del vettore, es: Rossi
        $table->string('dtv_titolo', 10)->nullable(); // Titolo del vettore, es: Sig.
        $table->string('dtv_cod_eroi', 17)->nullable(); // Codice EROI del vettore, es: 1234567890
        $table->string('dtv_numero_licenza_guida', 20)->nullable(); // Numero di licenza di guida del vettore, es: AB123456
        $table->string('dtv_mezzo_trasporto', 80)->nullable(); // Mezzo di trasporto del vettore, es: Camion
        $table->string('dtv_causale_trasporto', 100)->nullable(); // Causale del trasporto, es: Vendita prodotti
        $table->integer('dtv_numero_colli')->nullable(); // Numero di colli del trasporto, es: 10
        $table->string('dtv_descrizione', 20)->nullable(); // Descrizione del trasporto, es: Trasporto merci
        $table->string('dtv_unita_misura_perso', 10)->nullable(); // Unità di misura del peso, es: KG (chilogrammi), LT (litri), M3 (metri cubi)
        $table->integer('dtv_peso_lordo')->nullable(); // Peso lordo del trasporto, es: 1200 (in unità di misura specificata)
        $table->integer('dtv_peso_netto')->nullable(); // Peso netto del trasporto, es: 1000 (in unità di misura specificata)
        $table->timestamp('dtv_data_ora_ritiro')->nullable(); // Data e ora di inizio del trasporto, es: 2023-01-01T10:00:00
        $table->timestamp('dtv_data_inizio_trasporto')->nullable(); // Data e ora di inizio del trasporto, es: 2023-01-01T10:00:00
        $table->string('dtv_tipo_resa', 3)->nullable(); // Tipo di resa del trasporto, es: C (CIF), F (FOB), D (DDP)
        $table->string('dtv_indirizzo', 60)->nullable(); // Indirizzo del luogo di ritiro, es: Via Roma 1
        $table->string('dtv_numero_civico', 8)->nullable(); // Numero civico del luogo di ritiro, es: 1
        $table->string('dtv_cap', 5)->nullable(); // CAP del luogo di ritiro, es: 00100
        $table->string('dtv_comune', 60)->nullable(); // Comune del luogo di ritiro, es: Roma
        $table->string('dtv_provincia', 2)->nullable(); // Provincia del luogo di ritiro, es: RM
        $table->string('dtv_nazione', 2)->nullable(); // Nazione del luogo di ritiro, es: IT
        $table->timestamp('dtv_data_ora_consegna')->nullable(); // Data e ora di consegna del trasporto, es: 2023-01-01T12:00:00
        $table->string('dtv_numero_fattura_principale', 20)->nullable(); // Numero della fattura principale, es: 123456
        $table->date('dtv_data_fattura_principale')->nullable(); // Data della fattura principale, es: 2023-01-01
    }

    public function datiVeicoli(Blueprint $table): void
    {
        $table->date('dv_data')->nullable(); // Data del veicolo, es: 2023-01-01
        $table->string('dv_totale_percorso', 15)->nullable(); // Totale percorso del veicolo, es: 1000 km
    }

    public function datiPagamento(Blueprint $table): void
    {
        $table->string('condizioni_pagamento', 4)->default('TP01'); // Condizioni di pagamento, es: TP01 (Pagamento a rate), TP02 (Pagamento completo), TP03 (anticipo)

        Schema::create('document_installments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->string('beneficiario', 200)->nullable(); // Beneficiario del pagamento, es: Nome Azienda
            $table->string('modalità_pagamento', 4); // Metodo di pagamento, es: Bonifico, Carta di credito
            $table->date('data_riferimento_termini_pagamento')->nullable(); // Data di riferimento per i termini di pagamento, es: 2023-01-01
            $table->integer('giorni_termini_pagamento')->nullable(); // Giorni per i termini di pagamento, es: 30
            $table->date('data_scadenza_pagamento')->nullable(); // Data di scadenza del pagamento, es: 2023-01-31
            $table->integer('importo_pagamento')->default(0); // Importo del pagamento in centesimi, es: 10000 (100,00 EUR)
            $table->string('cod_ufficio_postale', 15)->nullable(); // Codice ufficio postale, es: 123456
            $table->string('cognome_quietanzante', 60)->nullable(); // Cognome del quietanzante, es: Rossi
            $table->string('nome_quietanzante', 60)->nullable(); // Nome del quietanzante, es: Mario
            $table->string('cf_quietanzante', 16)->nullable(); // Codice fiscale del quietanzante, es: 00000000000
            $table->string('titolo_quietanzante', 10)->nullable(); // Titolo del quietanzante, es: Sig.
            $table->string('istituto_finanziario', 80)->nullable(); // Istituto finanziario, es: Banca XYZ
            $table->string('iban', 34)->nullable(); // IBAN del pagamento, es: IT60X0542811101000000123456
            $table->string('abi', 5)->nullable(); // ABI del pagamento, es: 05428
            $table->string('cab', 5)->nullable(); // CAB del pagamento, es: 11101
            $table->string('bic', 11)->nullable(); // BIC del pagamento, es: ABCDITMMXXX
            $table->integer('sconto_pagamento_anticipato')->nullable(); // Sconto per pagamento anticipato, es: 5% (5 percento)
            $table->date('data_limite_pagamento_anticipato')->nullable(); // Data limite per il pagamento anticipato, es: 2023-01-15
            $table->integer('penalita_pagamenti_ritardati')->nullable(); // Penalità per pagamento ritardato, es: 10% (10 percento)
            $table->date('data_decorrenza_penale')->nullable(); // Data di decorrenza della penalità, es: 2023-01-10
            $table->string('codice_pagamento', 60)->nullable(); // Codice di pagamento, es: 1234567890
            $table->timestamps();

            $table->foreign('document_id')
                ->references('id')
                ->on('documents')
                ->cascadeOnDelete();
        });
    }

    public function allegati(): void
    {
        Schema::create('document_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->string('nome_attachment', 60);
            $table->string('algoritmo_compressione', 10)->nullable();
            $table->string('formato_attachment', 10)->nullable();
            $table->string('descrizione_attachment', 100)->nullable();
            $table->timestamps();

            $table->foreign('document_id')
                ->references('id')
                ->on('documents')
                ->cascadeOnDelete();
        });
    }
};

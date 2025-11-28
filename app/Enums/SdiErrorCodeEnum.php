<?php

namespace App\Enums;

/**
 * SDI Error Codes - Codici errore Sistema di Interscambio
 * Source: https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/fatturazione-elettronica
 */
enum SdiErrorCodeEnum: string
{
    // Errori Formato e Struttura XML
    case FORMAT_00200 = '00200';
    case FORMAT_00201 = '00201';
    case FORMAT_00202 = '00202';
    case FORMAT_00300 = '00300';
    case FORMAT_00301 = '00301';
    case FORMAT_00302 = '00302';
    case FORMAT_00303 = '00303';
    case FORMAT_00304 = '00304';
    case FORMAT_00305 = '00305';
    case FORMAT_00400 = '00400';
    case FORMAT_00401 = '00401';
    case FORMAT_00402 = '00402';
    case FORMAT_00403 = '00403';
    case FORMAT_00404 = '00404';
    case FORMAT_00405 = '00405';
    case FORMAT_00409 = '00409';
    case FORMAT_00411 = '00411';
    case FORMAT_00413 = '00413';
    case FORMAT_00415 = '00415';
    case FORMAT_00417 = '00417';
    case FORMAT_00418 = '00418';
    case FORMAT_00419 = '00419';
    case FORMAT_00420 = '00420';
    case FORMAT_00421 = '00421';
    case FORMAT_00422 = '00422';
    case FORMAT_00423 = '00423';
    case FORMAT_00424 = '00424';
    case FORMAT_00425 = '00425';
    case FORMAT_00426 = '00426';
    case FORMAT_00427 = '00427';
    case FORMAT_00428 = '00428';
    case FORMAT_00429 = '00429';
    case FORMAT_00430 = '00430';
    case FORMAT_00431 = '00431';
    case FORMAT_00432 = '00432';
    case FORMAT_00433 = '00433';
    case FORMAT_00434 = '00434';
    case FORMAT_00435 = '00435';
    case FORMAT_00436 = '00436';
    case FORMAT_00437 = '00437';
    case FORMAT_00438 = '00438';
    case FORMAT_00439 = '00439';
    case FORMAT_00440 = '00440';
    case FORMAT_00441 = '00441';
    case FORMAT_00442 = '00442';
    case FORMAT_00443 = '00443';
    case FORMAT_00444 = '00444';
    case FORMAT_00445 = '00445';
    case FORMAT_00446 = '00446';
    case FORMAT_00450 = '00450';
    case FORMAT_00451 = '00451';
    case FORMAT_00452 = '00452';
    case FORMAT_00453 = '00453';
    case FORMAT_00454 = '00454';
    case FORMAT_00460 = '00460';
    case FORMAT_00461 = '00461';
    case FORMAT_00462 = '00462';
    case FORMAT_00463 = '00463';
    case FORMAT_00464 = '00464';
    case FORMAT_00465 = '00465';
    case FORMAT_00466 = '00466';
    case FORMAT_00467 = '00467';
    case FORMAT_00468 = '00468';
    case FORMAT_00469 = '00469';
    case FORMAT_00470 = '00470';
    case FORMAT_00471 = '00471';
    case FORMAT_00472 = '00472';
    case FORMAT_00473 = '00473';

    /**
     * Get human-readable description
     */
    public function getDescription(): string
    {
        return match ($this) {
            self::FORMAT_00200 => 'File non conforme al formato',
            self::FORMAT_00201 => 'File non conforme allo schema XSD',
            self::FORMAT_00202 => 'File vuoto o illeggibile',
            self::FORMAT_00300 => 'Formato del file non conforme (non XML)',
            self::FORMAT_00301 => 'IdTrasmittente non valido',
            self::FORMAT_00302 => 'FormatoTrasmissione non valido',
            self::FORMAT_00303 => 'CodiceDestinatario non valido',
            self::FORMAT_00304 => 'PECDestinatario non valida',
            self::FORMAT_00305 => 'IdTrasmittente non corrispondente',
            self::FORMAT_00400 => 'Partita IVA cedente/prestatore non valida',
            self::FORMAT_00401 => 'Codice Fiscale cedente/prestatore non valido',
            self::FORMAT_00402 => 'IdFiscaleIVA cedente/prestatore non valorizzato',
            self::FORMAT_00403 => 'IdFiscaleIVA cedente/prestatore non presente in Anagrafe Tributaria',
            self::FORMAT_00404 => 'Partita IVA cessionario/committente non valida',
            self::FORMAT_00405 => 'Codice Fiscale cessionario/committente non valido',
            self::FORMAT_00409 => 'Partita IVA e Codice Fiscale cedente/prestatore non corrispondenti',
            self::FORMAT_00411 => 'IdFiscaleIVA del TerzoIntermediario non valido',
            self::FORMAT_00413 => 'Regime Fiscale non valido',
            self::FORMAT_00415 => 'Codice Fiscale rappresentante fiscale non valido',
            self::FORMAT_00417 => 'Partita IVA rappresentante fiscale non valida',
            self::FORMAT_00418 => 'IdFiscaleIVA del rappresentante fiscale non valorizzato',
            self::FORMAT_00419 => 'IdFiscaleIVA del rappresentante fiscale non presente in Anagrafe',
            self::FORMAT_00420 => 'Aliquota IVA non valida',
            self::FORMAT_00421 => 'Natura operazione non valida',
            self::FORMAT_00422 => 'TipoDocumento non valido',
            self::FORMAT_00423 => 'Data del documento non valida (futura)',
            self::FORMAT_00424 => 'Numero del documento non valido',
            self::FORMAT_00425 => 'Data del documento precedente non valida',
            self::FORMAT_00426 => 'Numero del documento precedente non valido',
            self::FORMAT_00427 => 'IdPaese del cedente/prestatore non valido',
            self::FORMAT_00428 => 'CAP non valido',
            self::FORMAT_00429 => 'Modalità pagamento non valida',
            self::FORMAT_00430 => 'Codice ritenuta non valido',
            self::FORMAT_00431 => 'Causale ritenuta non valida',
            self::FORMAT_00432 => 'TipoRitenuta non valido',
            self::FORMAT_00433 => 'Importi non coerenti (totale ≠ somma imponibile + IVA)',
            self::FORMAT_00434 => 'TipoCassa non valido',
            self::FORMAT_00435 => 'ImportoBollo non valido',
            self::FORMAT_00436 => 'TipoSpesa non valido',
            self::FORMAT_00437 => 'AltriDatiGestionali non validi',
            self::FORMAT_00438 => 'Numero Protocollo SoggettoEmittente non ammesso',
            self::FORMAT_00439 => 'Sconto/Maggiorazione non coerente',
            self::FORMAT_00440 => 'IdPaese del cessionario/committente non valido',
            self::FORMAT_00441 => 'CAP cessionario/committente non valido',
            self::FORMAT_00442 => 'Provincia cessionario/committente non valida',
            self::FORMAT_00443 => 'Nazione cessionario/committente non valida',
            self::FORMAT_00444 => 'Provincia cedente/prestatore non valida',
            self::FORMAT_00445 => 'Nazione cedente/prestatore non valida',
            self::FORMAT_00446 => 'Codice Articolo non valido',
            self::FORMAT_00450 => 'Dati del TerzoIntermediario non validi',
            self::FORMAT_00451 => 'Numero fattura PA già presente',
            self::FORMAT_00452 => 'CodiceIPA non censito',
            self::FORMAT_00453 => 'CIG non valido',
            self::FORMAT_00454 => 'CUP non valido',
            self::FORMAT_00460 => 'Splitting payment: Natura operazione non ammessa',
            self::FORMAT_00461 => 'Numero fattura già presente (duplicato)',
            self::FORMAT_00462 => 'Data fattura non coerente con periodo riferimento',
            self::FORMAT_00463 => 'Dati Cassa Previdenza non corretti',
            self::FORMAT_00464 => 'Dettagli linee non coerenti',
            self::FORMAT_00465 => 'Dati Pagamento non corretti',
            self::FORMAT_00466 => 'Aliquota IVA 0% senza Natura',
            self::FORMAT_00467 => 'Data scadenza pagamento non valida',
            self::FORMAT_00468 => 'Ritenuta: percentuale non ammessa',
            self::FORMAT_00469 => 'EsigibilitaIVA non valida',
            self::FORMAT_00470 => 'RiferimentoAmministrazione non valido',
            self::FORMAT_00471 => 'AltriDatiGestionali: tipo dato non ammesso',
            self::FORMAT_00472 => 'CodiceCUU non valido',
            self::FORMAT_00473 => 'ScontoMaggiorazione: tipo non ammesso',
            default => 'Errore sconosciuto: '.$this->value,
        };
    }

    /**
     * Get actionable suggestion for fixing the error
     */
    public function getSuggestion(): string
    {
        return match ($this) {
            self::FORMAT_00200, self::FORMAT_00201, self::FORMAT_00202, self::FORMAT_00300 => 'Rigenera la fattura. Se il problema persiste, contatta il supporto tecnico.',

            self::FORMAT_00301, self::FORMAT_00305 => 'Verifica la P.IVA o Codice Fiscale del trasmittente nei dati azienda.',

            self::FORMAT_00302 => 'Il formato trasmissione deve essere "FPR12" per fatture ordinarie.',

            self::FORMAT_00303 => 'Il Codice Destinatario deve essere di 7 caratteri. Se il cliente non ha SDI, usa "0000000" e inserisci la PEC.',

            self::FORMAT_00304 => 'L\'indirizzo PEC del destinatario non è valido. Verifica che sia una PEC certificata.',

            self::FORMAT_00400, self::FORMAT_00401, self::FORMAT_00402 => 'Verifica P.IVA e Codice Fiscale nei dati azienda. Devono essere validi e registrati in Anagrafe Tributaria.',

            self::FORMAT_00403 => 'La P.IVA del cedente non è presente in Anagrafe Tributaria. Verifica che sia attiva e corretta.',

            self::FORMAT_00404, self::FORMAT_00405 => 'Verifica P.IVA e Codice Fiscale del cliente. Controlla che siano formalmente corretti (11 cifre per P.IVA, 16 per CF).',

            self::FORMAT_00409 => 'P.IVA e Codice Fiscale del cedente non corrispondono. Per persone fisiche, il CF può essere uguale alla P.IVA.',

            self::FORMAT_00413 => 'Il Regime Fiscale deve essere un codice valido (RF01-RF19). Verifica nelle impostazioni azienda.',

            self::FORMAT_00420 => 'L\'aliquota IVA inserita non è ammessa. Usa valori standard: 0%, 4%, 5%, 10%, 22%.',

            self::FORMAT_00421 => 'Per IVA 0% devi specificare la Natura dell\'operazione (N1-N7). Es: N4 per esenti, N2.1 per non soggette.',

            self::FORMAT_00422 => 'TipoDocumento non valido. Usa TD01 per fatture ordinarie, TD04 per note di credito.',

            self::FORMAT_00423 => 'La data del documento è futura. Usa la data di emissione corretta (oggi o passata).',

            self::FORMAT_00424 => 'Il numero della fattura non è valido. Deve essere univoco e progressivo.',

            self::FORMAT_00428, self::FORMAT_00441 => 'Il CAP inserito non è valido. Deve essere di 5 cifre numeriche. Per l\'estero usa 00000.',

            self::FORMAT_00429 => 'La Modalità di Pagamento non è valida. Usa codici standard (MP01-MP23). Es: MP05 per bonifico, MP01 per contanti.',

            self::FORMAT_00433 => 'Gli importi non tornano! Verifica che: Totale Documento = Somma Imponibili + IVA + Bollo. Controlla arrotondamenti.',

            self::FORMAT_00435 => 'L\'Importo Bollo deve essere 2.00€ (quando applicabile, per fatture esenti > 77.47€).',

            self::FORMAT_00442, self::FORMAT_00444 => 'La Provincia deve essere la sigla di 2 lettere (es: MI, RM, NA). Per l\'estero usa EE.',

            self::FORMAT_00443, self::FORMAT_00445 => 'Il codice Nazione deve essere ISO 3166 (2 lettere). Italia = IT, Svizzera = CH, etc.',

            self::FORMAT_00451 => 'Questa fattura è già stata inviata! Il numero fattura risulta duplicato per la PA. Cambia il numero progressivo.',

            self::FORMAT_00461 => 'Numero fattura duplicato! Hai già inviato una fattura con questo numero. Usa un progressivo nuovo.',

            self::FORMAT_00466 => 'Hai IVA 0% senza specificare la Natura. Aggiungi il codice Natura (N1-N7) per spiegare l\'esenzione.',

            self::FORMAT_00469 => 'EsigibilitaIVA non valida. Usa: "I" per immediata, "D" per differita, "S" per split payment.',

            default => 'Verifica i dati della fattura e correggi il campo indicato nell\'errore. Consulta la documentazione SDI per dettagli.',
        };
    }

    /**
     * Get documentation link for this error
     */
    public function getDocumentationLink(): string
    {
        return 'https://www.agenziaentrate.gov.it/portale/documents/20143/233439/Codici+degli+esiti+FatturaPA_+28112014.pdf';
    }

    /**
     * Get severity level
     */
    public function getSeverity(): string
    {
        return match ($this) {
            self::FORMAT_00200, self::FORMAT_00201, self::FORMAT_00202, self::FORMAT_00300 => 'critical',
            self::FORMAT_00403, self::FORMAT_00433, self::FORMAT_00451, self::FORMAT_00461 => 'high',
            default => 'medium',
        };
    }

    /**
     * Can be auto-fixed?
     */
    public function isAutoFixable(): bool
    {
        return match ($this) {
            self::FORMAT_00302, // FormatoTrasmissione fisso
            self::FORMAT_00422, // TipoDocumento può essere corretto
            self::FORMAT_00428, self::FORMAT_00441, // CAP formattabile
            self::FORMAT_00442, self::FORMAT_00444, // Provincia uppercase
            self::FORMAT_00466 => true, // Natura auto-aggiungibile
            default => false,
        };
    }

    /**
     * Parse error code from SDI message
     */
    public static function parseFromMessage(string $message): ?self
    {
        // Extract error code from message (format: "00404 - Description")
        if (preg_match('/^(\d{5})/', $message, $matches)) {
            $code = $matches[1];

            return self::tryFrom($code);
        }

        return null;
    }
}

# Esempi XML Fattura Elettronica v1.9

## Esempio 1: Fattura Semplice Abbonamento Palestra

```xml
<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="1.9" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.9">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>12345678901</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>12345_20251111120000_ABC12</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>0000000</CodiceDestinatario>
      <PECDestinatario>mario.rossi@pec.it</PECDestinatario>
    </DatiTrasmissione>
    
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>12345678901</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Fitness Club SSD a r.l.</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Roma 123</Indirizzo>
        <CAP>00100</CAP>
        <Comune>Roma</Comune>
        <Provincia>RM</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
      <Contatti>
        <Telefono>0612345678</Telefono>
        <Email>info@fitnessclub.it</Email>
      </Contatti>
    </CedentePrestatore>
    
    <CessionarioCommittente>
      <DatiAnagrafici>
        <CodiceFiscale>RSSMRA80A01H501U</CodiceFiscale>
        <Anagrafica>
          <Nome>Mario</Nome>
          <Cognome>Rossi</Cognome>
        </Anagrafica>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Milano 45</Indirizzo>
        <CAP>20100</CAP>
        <Comune>Milano</Comune>
        <Provincia>MI</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>2025-11-11</Data>
        <Numero>FT2025/0001</Numero>
        <ImportoTotaleDocumento>244.00</ImportoTotaleDocumento>
        <Causale>Abbonamento annuale palestra</Causale>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>Abbonamento Annuale Gold - Accesso illimitato sala pesi e corsi</Descrizione>
        <Quantita>1.00</Quantita>
        <UnitaMisura>PZ</UnitaMisura>
        <PrezzoUnitario>200.00</PrezzoUnitario>
        <PrezzoTotale>200.00</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      
      <DatiRiepilogo>
        <AliquotaIVA>22.00</AliquotaIVA>
        <ImponibileImporto>200.00</ImponibileImporto>
        <Imposta>44.00</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>
    </DatiBeniServizi>
    
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>MP05</ModalitaPagamento>
        <DataScadenzaPagamento>2025-11-25</DataScadenzaPagamento>
        <ImportoPagamento>244.00</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
```

## Esempio 2: Fattura con Sconto e Più Righe

```xml
<FatturaElettronicaBody>
  <DatiGenerali>
    <DatiGeneraliDocumento>
      <TipoDocumento>TD01</TipoDocumento>
      <Divisa>EUR</Divisa>
      <Data>2025-11-11</Data>
      <Numero>FT2025/0002</Numero>
      <ImportoTotaleDocumento>793.00</ImportoTotaleDocumento>
      <Causale>Abbonamento + Personal Training</Causale>
    </DatiGeneraliDocumento>
  </DatiGenerali>
  
  <DatiBeniServizi>
    <DettaglioLinee>
      <NumeroLinea>1</NumeroLinea>
      <Descrizione>Abbonamento Mensile Base</Descrizione>
      <Quantita>1.00</Quantita>
      <UnitaMisura>PZ</UnitaMisura>
      <PrezzoUnitario>50.00</PrezzoUnitario>
      <PrezzoTotale>50.00</PrezzoTotale>
      <AliquotaIVA>22.00</AliquotaIVA>
    </DettaglioLinee>
    
    <DettaglioLinee>
      <NumeroLinea>2</NumeroLinea>
      <Descrizione>Pacchetto 10 Personal Training</Descrizione>
      <Quantita>1.00</Quantita>
      <UnitaMisura>PZ</UnitaMisura>
      <PrezzoUnitario>500.00</PrezzoUnitario>
      <ScontoMaggiorazione>
        <Tipo>SC</Tipo>
        <Percentuale>10.00</Percentuale>
      </ScontoMaggiorazione>
      <PrezzoTotale>450.00</PrezzoTotale>
      <AliquotaIVA>22.00</AliquotaIVA>
    </DettaglioLinee>
    
    <DettaglioLinee>
      <NumeroLinea>3</NumeroLinea>
      <Descrizione>Integratore Proteine 1kg</Descrizione>
      <Quantita>2.00</Quantita>
      <UnitaMisura>PZ</UnitaMisura>
      <PrezzoUnitario>30.00</PrezzoUnitario>
      <PrezzoTotale>60.00</PrezzoTotale>
      <AliquotaIVA>10.00</AliquotaIVA>
    </DettaglioLinee>
    
    <DatiRiepilogo>
      <AliquotaIVA>22.00</AliquotaIVA>
      <ImponibileImporto>500.00</ImponibileImporto>
      <Imposta>110.00</Imposta>
      <EsigibilitaIVA>I</EsigibilitaIVA>
    </DatiRiepilogo>
    
    <DatiRiepilogo>
      <AliquotaIVA>10.00</AliquotaIVA>
      <ImponibileImporto>60.00</ImponibileImporto>
      <Imposta>6.00</Imposta>
      <EsigibilitaIVA>I</EsigibilitaIVA>
    </DatiRiepilogo>
  </DatiBeniServizi>
  
  <DatiPagamento>
    <CondizioniPagamento>TP02</CondizioniPagamento>
    <DettaglioPagamento>
      <ModalitaPagamento>MP08</ModalitaPagamento>
      <DataScadenzaPagamento>2025-11-11</DataScadenzaPagamento>
      <ImportoPagamento>676.00</ImportoPagamento>
    </DettaglioPagamento>
  </DatiPagamento>
</FatturaElettronicaBody>
```

## Esempio 3: Fattura Professionista con Ritenuta d'Acconto

```xml
<FatturaElettronicaBody>
  <DatiGenerali>
    <DatiGeneraliDocumento>
      <TipoDocumento>TD06</TipoDocumento>
      <Divisa>EUR</Divisa>
      <Data>2025-11-11</Data>
      <Numero>PAR2025/0001</Numero>
      
      <DatiRitenuta>
        <TipoRitenuta>RT01</TipoRitenuta>
        <ImportoRitenuta>40.00</ImportoRitenuta>
        <AliquotaRitenuta>20.00</AliquotaRitenuta>
        <CausalePagamento>A</CausalePagamento>
      </DatiRitenuta>
      
      <DatiBollo>
        <BolloVirtuale>SI</BolloVirtuale>
        <ImportoBollo>2.00</ImportoBollo>
      </DatiBollo>
      
      <ImportoTotaleDocumento>206.00</ImportoTotaleDocumento>
      <Causale>Consulenza nutrizionale sportiva</Causale>
    </DatiGeneraliDocumento>
  </DatiGenerali>
  
  <DatiBeniServizi>
    <DettaglioLinee>
      <NumeroLinea>1</NumeroLinea>
      <Descrizione>Consulenza nutrizionale per atleti - 3 incontri</Descrizione>
      <Quantita>1.00</Quantita>
      <UnitaMisura>PZ</UnitaMisura>
      <PrezzoUnitario>200.00</PrezzoUnitario>
      <PrezzoTotale>200.00</PrezzoTotale>
      <AliquotaIVA>22.00</AliquotaIVA>
    </DettaglioLinee>
    
    <DatiRiepilogo>
      <AliquotaIVA>22.00</AliquotaIVA>
      <ImponibileImporto>200.00</ImponibileImporto>
      <Imposta>44.00</Imposta>
      <EsigibilitaIVA>I</EsigibilitaIVA>
    </DatiRiepilogo>
  </DatiBeniServizi>
  
  <DatiPagamento>
    <CondizioniPagamento>TP02</CondizioniPagamento>
    <DettaglioPagamento>
      <ModalitaPagamento>MP05</ModalitaPagamento>
      <DataScadenzaPagamento>2025-12-11</DataScadenzaPagamento>
      <ImportoPagamento>206.00</ImportoPagamento>
    </DettaglioPagamento>
  </DatiPagamento>
</FatturaElettronicaBody>
```

## Esempio 4: Fattura con IVA Esente (Regime Forfetario)

```xml
<FatturaElettronicaHeader>
  <CedentePrestatore>
    <DatiAnagrafici>
      <IdFiscaleIVA>
        <IdPaese>IT</IdPaese>
        <IdCodice>12345678901</IdCodice>
      </IdFiscaleIVA>
      <Anagrafica>
        <Nome>Luigi</Nome>
        <Cognome>Verdi</Cognome>
      </Anagrafica>
      <RegimeFiscale>RF19</RegimeFiscale>
    </DatiAnagrafici>
    <!-- ... sede ... -->
  </CedentePrestatore>
</FatturaElettronicaHeader>

<FatturaElettronicaBody>
  <DatiGenerali>
    <DatiGeneraliDocumento>
      <TipoDocumento>TD01</TipoDocumento>
      <Divisa>EUR</Divisa>
      <Data>2025-11-11</Data>
      <Numero>FT2025/0003</Numero>
      <ImportoTotaleDocumento>100.00</ImportoTotaleDocumento>
      <Causale>Prestazione Personal Training</Causale>
    </DatiGeneraliDocumento>
  </DatiGenerali>
  
  <DatiBeniServizi>
    <DettaglioLinee>
      <NumeroLinea>1</NumeroLinea>
      <Descrizione>Personal Training - 5 sessioni individuali</Descrizione>
      <Quantita>1.00</Quantita>
      <UnitaMisura>PZ</UnitaMisura>
      <PrezzoUnitario>100.00</PrezzoUnitario>
      <PrezzoTotale>100.00</PrezzoTotale>
      <AliquotaIVA>0.00</AliquotaIVA>
      <Natura>N2.2</Natura>
    </DettaglioLinee>
    
    <DatiRiepilogo>
      <AliquotaIVA>0.00</AliquotaIVA>
      <Natura>N2.2</Natura>
      <ImponibileImporto>100.00</ImponibileImporto>
      <Imposta>0.00</Imposta>
      <RiferimentoNormativo>Regime forfetario L.190/2014 art.1 c.54-89</RiferimentoNormativo>
    </DatiRiepilogo>
  </DatiBeniServizi>
  
  <DatiPagamento>
    <CondizioniPagamento>TP02</CondizioniPagamento>
    <DettaglioPagamento>
      <ModalitaPagamento>MP01</ModalitaPagamento>
      <ImportoPagamento>100.00</ImportoPagamento>
    </DettaglioPagamento>
  </DatiPagamento>
</FatturaElettronicaBody>
```

## Esempio 5: Nota di Credito

```xml
<FatturaElettronicaBody>
  <DatiGenerali>
    <DatiGeneraliDocumento>
      <TipoDocumento>TD04</TipoDocumento>
      <Divisa>EUR</Divisa>
      <Data>2025-11-15</Data>
      <Numero>NC2025/0001</Numero>
      <ImportoTotaleDocumento>61.00</ImportoTotaleDocumento>
      <Causale>Storno abbonamento per infortunio</Causale>
    </DatiGeneraliDocumento>
    
    <DatiFattureCollegate>
      <IdDocumento>FT2025/0001</IdDocumento>
      <Data>2025-11-11</Data>
    </DatiFattureCollegate>
  </DatiGenerali>
  
  <DatiBeniServizi>
    <DettaglioLinee>
      <NumeroLinea>1</NumeroLinea>
      <Descrizione>Storno Abbonamento Mensile Base</Descrizione>
      <Quantita>1.00</Quantita>
      <UnitaMisura>PZ</UnitaMisura>
      <PrezzoUnitario>-50.00</PrezzoUnitario>
      <PrezzoTotale>-50.00</PrezzoTotale>
      <AliquotaIVA>22.00</AliquotaIVA>
    </DettaglioLinee>
    
    <DatiRiepilogo>
      <AliquotaIVA>22.00</AliquotaIVA>
      <ImponibileImporto>-50.00</ImponibileImporto>
      <Imposta>-11.00</Imposta>
      <EsigibilitaIVA>I</EsigibilitaIVA>
    </DatiRiepilogo>
  </DatiBeniServizi>
  
  <DatiPagamento>
    <CondizioniPagamento>TP02</CondizioniPagamento>
    <DettaglioPagamento>
      <ModalitaPagamento>MP05</ModalitaPagamento>
      <ImportoPagamento>-61.00</ImportoPagamento>
    </DettaglioPagamento>
  </DatiPagamento>
</FatturaElettronicaBody>
```

## Esempio 6: Fattura con Cassa Previdenziale

```xml
<DatiGenerali>
  <DatiGeneraliDocumento>
    <TipoDocumento>TD06</TipoDocumento>
    <Divisa>EUR</Divisa>
    <Data>2025-11-11</Data>
    <Numero>PAR2025/0002</Numero>
    
    <DatiCassaPrevidenziale>
      <TipoCassa>TC01</TipoCassa>
      <AlCassa>4.00</AlCassa>
      <ImportoContributoCassa>8.00</ImportoContributoCassa>
      <ImponibileCassa>200.00</ImponibileCassa>
      <AliquotaIVA>22.00</AliquotaIVA>
    </DatiCassaPrevidenziale>
    
    <ImportoTotaleDocumento>253.76</ImportoTotaleDocumento>
    <Causale>Prestazione fisioterapica sportiva</Causale>
  </DatiGeneraliDocumento>
</DatiGenerali>

<DatiBeniServizi>
  <DettaglioLinee>
    <NumeroLinea>1</NumeroLinea>
    <Descrizione>Trattamento fisioterapico post-allenamento - 4 sedute</Descrizione>
    <Quantita>1.00</Quantita>
    <UnitaMisura>PZ</UnitaMisura>
    <PrezzoUnitario>200.00</PrezzoUnitario>
    <PrezzoTotale>200.00</PrezzoTotale>
    <AliquotaIVA>22.00</AliquotaIVA>
  </DettaglioLinee>
  
  <DatiRiepilogo>
    <AliquotaIVA>22.00</AliquotaIVA>
    <ImponibileImporto>208.00</ImponibileImporto>
    <Imposta>45.76</Imposta>
    <EsigibilitaIVA>I</EsigibilitaIVA>
  </DatiRiepilogo>
</DatiBeniServizi>
```

## Codici Errore SDI Comuni

### Errore 00300: IdTrasmittente non valido
```
Causa: P.IVA cedente non censita in Anagrafe Tributaria
Soluzione: Verificare vat_number in structure
```

### Errore 00305: CodiceFiscale cessionario non valido
```
Causa: CF cliente errato o non esistente
Soluzione: Validare tax_code con algoritmo CF italiano
```

### Errore 00311: CodiceDestinatario non valido
```
Causa: Codice SDI non accreditato
Soluzione: Usare "0000000" + PEC oppure verificare sdi_code
```

### Errore 00417: IdFiscaleIVA e CodiceFiscale mancanti
```
Causa: Cliente senza P.IVA né CF
Soluzione: Richiedere almeno uno dei due al cliente
```

### Errore 00428: FormatoTrasmissione non coerente
```
Causa: FPA12 per cliente privato o FPR12 per PA
Soluzione: Verificare is_public_administration in customer
```

## Note Tecniche

### Encoding
- Sempre UTF-8 senza BOM
- Caratteri speciali HTML escaped automaticamente da DOMDocument

### Namespace
- **Obbligatorio**: xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.9"
- **Versione**: versione="1.9" nell'attributo root

### Validazione XSD
Schema ufficiale: https://www.fatturapa.gov.it/export/documenti/fatturapa/v1.9/Schema_del_file_xml_FatturaPA_v1.9.xsd

### Lunghezze Campi
- `Causale`: max 200 caratteri
- `Descrizione` riga: max 1000 caratteri
- `Numero` fattura: max 20 caratteri
- `ProgressivoInvio`: max 10 caratteri

### Formato Date
- Sempre ISO 8601: YYYY-MM-DD
- Esempio: 2025-11-11

### Formato Numeri
- Decimali con punto (.) non virgola
- Sempre 2 decimali per importi: 100.00
- Massimo 8 decimali per aliquote/percentuali: 4.00


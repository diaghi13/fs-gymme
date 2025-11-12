# Setup PDF Fattura Elettronica

## Stato Implementazione

✅ **Completato** (12 Nov 2025):
- Template Blade per PDF (`resources/views/pdf/electronic-invoice.blade.php`)
- Controller `DownloadPdfController`
- Route `/sales/{sale}/electronic-invoice/download-pdf`
- Bottone "Scarica PDF" nel frontend
- Package `barryvdh/laravel-dompdf` v3.1 installato ✅
- Fix OpenSSL symlink applicato ✅

⏳ **Da Testare**:
- Test generazione PDF end-to-end
- Verifica layout e formattazione

## Problema OpenSSL (Homebrew)

Durante l'installazione del package, si è verificato un errore:

```
dyld: Library not loaded: /opt/homebrew/opt/openssl@3/lib/libssl.3.dylib
```

Questo è un problema di configurazione del sistema macOS con Homebrew.

## Soluzione Applicata: Fix OpenSSL Symlink ✅

Il problema è stato risolto creando il symlink mancante:

```bash
# Crea symlink per openssl@3
ln -sfn /opt/homebrew/Cellar/openssl@3/3.6.0 /opt/homebrew/opt/openssl@3

# Verifica
php -v
# PHP 8.3.27 (cli) ✅

composer require barryvdh/laravel-dompdf
# Successfully installed! ✅
```

### Altre Opzioni (se il symlink non funziona)

### Opzione 1: Reinstalla OpenSSL e PHP

```bash
# Reinstalla OpenSSL
brew reinstall openssl@3

# Reinstalla PHP
brew reinstall php@8.3

# Link openssl
brew link --force openssl@3

# Verifica
php -v
```

### Opzione 2: Link Manuale

```bash
# Crea symlink mancante
sudo mkdir -p /opt/homebrew/opt/openssl@3/lib
sudo ln -s /opt/homebrew/Cellar/openssl@3/*/lib/libssl.3.dylib /opt/homebrew/opt/openssl@3/lib/libssl.3.dylib
sudo ln -s /opt/homebrew/Cellar/openssl@3/*/lib/libcrypto.3.dylib /opt/homebrew/opt/openssl@3/lib/libcrypto.3.dylib
```

### Opzione 3: Usa Docker/Sail

Se il problema persiste, usa Laravel Sail per eseguire i comandi in un container:

```bash
./vendor/bin/sail composer require barryvdh/laravel-dompdf
```

## Installazione Package

Dopo aver risolto il problema OpenSSL:

```bash
composer require barryvdh/laravel-dompdf --no-interaction
```

Il package si installerà automaticamente e sarà pronto all'uso.

## Configurazione (Opzionale)

Publica la configurazione se hai bisogno di personalizzare:

```bash
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

Il file di config sarà in `config/dompdf.php`.

### Opzioni Utili

```php
// config/dompdf.php
return [
    'default_font' => 'DejaVu Sans',
    'dpi' => 96,
    'font_height_ratio' => 1.1,
    'enable_font_subsetting' => true,
    'enable_remote' => false,
];
```

## Test PDF

Dopo l'installazione, testa il PDF:

1. **Via Browser**:
   - Vai su una vendita con fattura elettronica generata
   - Click su "Scarica PDF"
   - Verifica che il PDF si scarichi correttamente

2. **Via Tinker**:
   ```bash
   php artisan tinker
   $sale = App\Models\Sale\Sale::with(['electronic_invoice', 'customer', 'saleRows.vatRate'])->first();
   $pdf = Pdf::loadView('pdf.electronic-invoice', ['sale' => $sale, 'tenant' => tenant()]);
   $pdf->save(storage_path('app/test-invoice.pdf'));
   exit
   ```

3. **Controlla il file**:
   ```bash
   open storage/app/test-invoice.pdf
   ```

## Caratteristiche PDF

Il template PDF include:

- ✅ Intestazione con numero fattura e data
- ✅ Dati Cedente/Prestatore (tenant)
- ✅ Dati Cessionario/Committente (customer)
- ✅ Dettaglio righe con prezzi e sconti
- ✅ Riepilogo IVA per aliquota
- ✅ Totali documento (imponibile, IVA, stamp duty)
- ✅ Note e causale
- ✅ Modalità di pagamento
- ✅ Footer con info trasmissione SDI

## Layout Professionale

Il PDF usa:
- Font: DejaVu Sans (supporta caratteri italiani)
- Formato: A4 Portrait
- Stile: Conforme alle fatture italiane tradizionali
- Tabelle con bordi neri
- Sezioni ben separate
- Totali evidenziati

## Aggiungere Logo Azienda (Opzionale)

Per aggiungere il logo del tenant:

1. Salva il logo in `storage/app/public/logos/{tenant_id}.png`

2. Modifica il template Blade:
   ```blade
   {{-- Dopo <h1>FATTURA ELETTRONICA</h1> --}}
   @if(Storage::disk('public')->exists("logos/{$tenant->id}.png"))
     <div style="text-align: center; margin-bottom: 20px;">
       <img src="{{ storage_path('app/public/logos/' . $tenant->id . '.png') }}"
            alt="Logo"
            style="max-width: 200px; height: auto;">
     </div>
   @endif
   ```

## Troubleshooting

### PDF Vuoto o Errore

**Problema**: Il PDF si scarica ma è vuoto

**Soluzione**:
- Controlla i log Laravel: `tail -f storage/logs/laravel.log`
- Verifica che tutte le relazioni siano caricate
- Controlla che il template Blade non abbia errori di sintassi

### Caratteri Mancanti

**Problema**: Caratteri speciali non vengono visualizzati

**Soluzione**:
- Usa font DejaVu Sans (già configurato)
- Evita font personalizzati che non supportano UTF-8

### Timeout Generazione

**Problema**: Il PDF impiega troppo tempo

**Soluzione**:
- Riduci la complessità del template
- Disabilita `enable_font_subsetting` in config
- Aumenta `max_execution_time` in PHP

## Riferimenti

- [Documentazione barryvdh/laravel-dompdf](https://github.com/barryvdh/laravel-dompdf)
- [Documentazione DOMPDF](https://github.com/dompdf/dompdf)
- [Fattura Elettronica - Rappresentazione Tabellare](https://www.agenziaentrate.gov.it/portale/web/guest/schede/dichiarazioni/fattura-elettronica)

---

**Ultimo aggiornamento**: 12 Novembre 2025
**Status**: ✅ Implementazione completa (pending package install)

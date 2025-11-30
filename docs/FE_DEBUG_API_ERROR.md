# 🔍 DEBUG Errore SDI - Logging Avanzato Attivato

## 🎯 Situazione

**Errore attuale**: "Errore invio fattura" (generico)  
**Ultimo errore SSL**: Risolto ✅  
**Nuovo problema**: La API risponde ma con errore non dettagliato

---

## ✅ Fix Applicato

Ho aggiunto **logging dettagliato** della risposta API nel Service:

```php
// Ora logga:
- HTTP Status Code
- Response Body completo
- JSON parsed
- Headers HTTP

Log::error('API Error Response', [
    'status' => $response->status(),
    'body' => $response->body(),
    'json' => $response->json(),
    'headers' => $response->headers(),
]);
```

---

## 🧪 Test Debug - SEGUI QUESTI STEP

### Step 1: Pulisci Log Vecchi

```bash
cd /Users/davidedonghi/Apps/fs-gymme
> storage/logs/laravel.log
```

### Step 2: Monitor Logs in Tempo Reale

Apri un **nuovo terminale** e lancia:

```bash
cd /Users/davidedonghi/Apps/fs-gymme
tail -f storage/logs/laravel.log
```

Lascialo aperto per vedere i logs in diretta!

### Step 3: Tenta Invio Fattura

1. Hard refresh browser: `Cmd+Shift+R`
2. Vai su vendita (status: `saved`)
3. Click "Invia a SDI"
4. Guarda il terminale con i logs!

### Step 4: Analizza Output

Nel terminale dovresti vedere:

```json
{
  "status": 401,  // O altro codice errore
  "body": "Credenziali non valide" // O altro messaggio
  "json": {...},
  "headers": {...}
}
```

**Mandami l'output completo!** Così posso capire esattamente cosa risponde il server.

---

## 🔍 Possibili Errori da Verificare

### 1. Autenticazione (401/403)

```
"error": "Credenziali non valide"
"error": "Unauthorized"
```

**Fix**: Verifica username/password nel gestionale

### 2. XML Malformato (400)

```
"error": "XML non valido"
"error": "Dati mancanti"
```

**Fix**: Controlla XML generato

### 3. Dati Azienda Mancanti (400)

```
"error": "Dati azienda mancanti nel gestionale"
```

**Fix**: Compila anagrafica completa nel gestionale

### 4. Endpoint Errato (404)

```
"status": 404
```

**Fix**: Verifica endpoint (già corretto: ws2.0/test)

---

## 📋 Checklist Pre-Test

- [x] Errore SSL risolto
- [x] Logging dettagliato aggiunto
- [x] Config cache cleared
- [x] `.env` configurato:
  ```
  FE_API_ENABLED=true
  FE_API_USERNAME=davide.d.donghi@gmail.com
  FE_API_PASSWORD=2XfnQvPT
  FE_API_SANDBOX=true
  ```

---

## 🚀 Procedi con il Test

1. **Pulisci logs**: `> storage/logs/laravel.log`
2. **Monitor**: `tail -f storage/logs/laravel.log` (nuovo terminale)
3. **Tenta invio** dal browser
4. **Copia output** del terminale e mandamelo!

---

**Con il logging dettagliato posso capire esattamente cosa risponde l'API!** 🔍


# 🔍 ANALISI COMPLETA SISTEMA SETTINGS & CONFIGURAZIONI
**Data Analisi**: 13 Gennaio 2025  
**Scope**: Identificare TUTTE le configurazioni tenant necessarie

---

## 📊 STATO ATTUALE

### Sistema Esistente ✅
**Model**: `TenantSetting` (già implementato)
**Tabella**: `tenant_settings` (già esistente)
**Metodi**: get(), set(), getGroup(), has(), forget()
**Caching**: Redis 1h per performance

### Pagine Configuration Esistenti
1. ✅ Company Configuration
2. ✅ Structure Configuration  
3. ✅ Financial Resources Configuration
4. ✅ Invoice Configuration (solo bollo)

---

## 🎯 ANALISI CONFIGURAZIONI NECESSARIE

### 1. ✅ COMPANY / TENANT (Fiscali - Già Implementato)

**Campi Tenant Model**:
```php
- name                    // Nome azienda
- slug                    // Slug univoco
- vat_number             // P.IVA (per FE)
- tax_code               // Codice Fiscale (per FE)
- address                // Indirizzo (per FE)
- city                   // Città (per FE)
- postal_code            // CAP (per FE)
- province               // Provincia (per FE) - MANCA?
- country                // Paese (per FE)
- phone                  // Telefono
- email                  // Email principale
- pec_email              // PEC (per FE - OBBLIGATORIO)
- sdi_code               // Codice SDI (alternativa PEC)
- fiscal_regime          // Regime fiscale (per FE) - AGGIUNTO RECENTE
```

**Status**: ✅ Implementato in Company Configuration

**Missing Fields**:
- [ ] `province` (2 lettere per FE)
- [ ] `fiscal_regime` (RF01-RF19 per FE)
- [ ] `website` (opzionale)
- [ ] `logo_path` (per PDF/email)

---

### 2. ⚠️ STRUCTURE SETTINGS (Sedi Operative)

**Model**: `Structure` (già esiste)

**Cosa Gestisce**:
- Nome sede
- Indirizzo sede
- Telefono/email sede
- Orari apertura (?)

**Status**: ✅ Parzialmente implementato

**Missing**:
- [ ] Orari apertura/chiusura
- [ ] Giorni chiusura
- [ ] Capienza massima
- [ ] Regole prenotazione

---

### 3. ⚠️ FINANCIAL RESOURCES (Già Implementato)

**Gestisce**:
- Metodi di pagamento disponibili
- Default payment method
- Active/inactive

**Status**: ✅ Implementato

**Possible Enhancements**:
- [ ] Commissioni per metodo (es: +3% carta)
- [ ] Limite importi per metodo
- [ ] Integrazione POS (Stripe Terminal)

---

### 4. ⚠️ INVOICE SETTINGS (Parziale)

**Attualmente**:
- ✅ Imposta di bollo (charge_customer, amount, threshold)

**Missing Critical**:
- [ ] **Numerazione progressiva**:
  - Prefisso fattura (es: "FT-")
  - Numero iniziale
  - Azzeramento annuale (si/no)
  - Formato (es: FT-2025-0001)
  
- [ ] **Default values**:
  - IVA predefinita (22%, 10%, 4%, 0%)
  - Note predefinite in fattura
  - Termini di pagamento (giorni)
  - Modalità pagamento predefinita
  
- [ ] **PDF Settings**:
  - Logo aziendale
  - Footer personalizzato
  - Note legali predefinite
  - Font/colori (branding)

- [ ] **Email Settings**:
  - Template email invio fattura
  - CC automatiche
  - BCC automatiche
  - Subject personalizzabile

---

### 5. ❌ VAT RATES (IVA - CRITICO)

**Attualmente**: Gestito con tabella `vat_rates`

**Analisi Necessaria**:
```sql
-- Tabelle esistenti:
vat_rates
vat_rate_groups
vat_rate_types
```

**Settings Necessari**:
- [ ] IVA predefinita vendite
- [ ] IVA predefinita acquisti
- [ ] Gestione split payment
- [ ] Gestione reverse charge
- [ ] Natura IVA per esenzioni (N1-N7)

---

### 6. ❌ EMAIL & NOTIFICATIONS (CRITICO)

**Email Settings**:
- [ ] Email sender (da TenantSetting)
- [ ] Email reply-to
- [ ] SMTP personalizzato? (opzionale)
- [ ] Signature email aziendale

**Notification Preferences**:
- [ ] Email fattura accettata SDI (on/off)
- [ ] Email fattura rifiutata SDI (on/off)
- [ ] Email nuovo customer (on/off)
- [ ] Email abbonamento scadenza (on/off)
- [ ] Email certificato medico scadenza (on/off)
- [ ] Email misurazioni reminder (on/off)
- [ ] Frequenza digest (daily/weekly/never)

**Recipients**:
- [ ] Admin emails (chi riceve notifiche)
- [ ] CC per fatture
- [ ] Emergency contacts

---

### 7. ❌ CUSTOMER SETTINGS

**Gestione Clienti**:
- [ ] Richiedi campi obbligatori:
  - [ ] Codice fiscale obbligatorio
  - [ ] Email obbligatoria
  - [ ] Telefono obbligatorio
  - [ ] Indirizzo completo obbligatorio
  
- [ ] Privacy & GDPR:
  - [ ] Durata conservazione dati (anni)
  - [ ] Auto-delete dopo inattività (giorni)
  - [ ] Consensi obbligatori
  
- [ ] Customer Portal:
  - [ ] Abilita area cliente (si/no)
  - [ ] Self-service prenotazioni
  - [ ] Visualizza storico pagamenti

---

### 8. ❌ SUBSCRIPTION SETTINGS (Abbonamenti)

**Regole Abbonamenti**:
- [ ] Giorni tolleranza pagamento
- [ ] Auto-sospendi dopo giorni
- [ ] Notifiche scadenza (quanti giorni prima)
- [ ] Rinnovo automatico (si/no)
- [ ] Prorata su upgrade/downgrade

**Proroghe & Sospensioni**:
- [ ] Max proroghe consecutive
- [ ] Max giorni sospensione
- [ ] Richiede certificato medico per sospensione

---

### 9. ❌ DOCUMENT TYPES SETTINGS

**Gestione Tipi Documento**:
- [ ] Tipi documento abilitati per tenant
- [ ] Numerazione separata per tipo
- [ ] Prefissi personalizzati
- [ ] Workflow approvazione (si/no)

---

### 10. ❌ MEASUREMENT SETTINGS (Misurazioni)

**Tracking Misurazioni**:
- [ ] Campi obbligatori misurazione
- [ ] Frequenza consigliata misurazioni
- [ ] Alert progressi cliente
- [ ] Privacy misurazioni (visibili a cliente?)

---

### 11. ❌ SPORTS REGISTRATION SETTINGS

**Tesseramenti**:
- [ ] Enti sportivi predefiniti
- [ ] Validità predefinita (mesi)
- [ ] Remind rinnovo (giorni prima)
- [ ] Blocca accesso senza tesseramento

---

### 12. ❌ MEDICAL CERTIFICATION SETTINGS

**Certificati Medici**:
- [ ] Obbligatorio per abbonamenti (si/no)
- [ ] Validità predefinita (mesi: 12 agonistico, 12 non)
- [ ] Remind scadenza (giorni prima)
- [ ] Blocca accesso senza certificato
- [ ] Tipi certificato richiesti

---

### 13. ❌ REGIONAL SETTINGS (Localizzazione)

**Lingua & Formato**:
- [ ] Lingua predefinita (it, en, es, fr)
- [ ] Timezone
- [ ] Formato data (dd/mm/yyyy, mm/dd/yyyy)
- [ ] Formato ora (12h, 24h)
- [ ] Valuta (EUR, USD, GBP)
- [ ] Formato numeri (decimali , o .)

---

### 14. ❌ SECURITY SETTINGS

**Sicurezza**:
- [ ] 2FA obbligatorio staff (si/no)
- [ ] Password complessità minima
- [ ] Session timeout (minuti)
- [ ] IP whitelist (opzionale)
- [ ] Audit log retention (giorni)

---

### 15. ❌ BOOKING SETTINGS (Se implementato)

**Prenotazioni**:
- [ ] Abilita prenotazioni online
- [ ] Anticipo minimo prenotazione (ore)
- [ ] Cancellazione entro (ore)
- [ ] Max prenotazioni per cliente
- [ ] Overbooking (%)

---

### 16. ❌ LOYALTY / POINTS SETTINGS (Futuro)

**Programma Fedeltà**:
- [ ] Punti per euro speso (ratio)
- [ ] Scadenza punti (mesi)
- [ ] Premi disponibili
- [ ] Livelli membership

---

### 17. ❌ INTEGRATION SETTINGS

**Integrazioni Esterne**:
- [ ] Google Calendar sync
- [ ] Mailchimp API key
- [ ] WhatsApp Business API
- [ ] Stripe Connect
- [ ] Facebook Pixel
- [ ] Google Analytics

---

### 18. ❌ BRANDING SETTINGS

**Brand & Design**:
- [ ] Logo (upload)
- [ ] Colori primari/secondari
- [ ] Font principale
- [ ] Slogan/tagline
- [ ] Social media links

---

### 19. ❌ BUSINESS HOURS

**Orari Operativi**:
- [ ] Orari per giorno settimana
- [ ] Giorni festivi
- [ ] Chiusure straordinarie
- [ ] Orari estivi/invernali

---

### 20. ❌ DATA RETENTION SETTINGS

**Conservazione Dati** (GDPR):
- [ ] Conserva fatture (anni: 10 obbligatorio)
- [ ] Conserva documenti (anni)
- [ ] Conserva log (giorni)
- [ ] Conserva customer inattivi (anni)
- [ ] Auto-anonimizza dopo (anni)

---

## 📋 PRIORITÀ IMPLEMENTAZIONE

### 🔥 PRIORITÀ MASSIMA (Pre Go-Live)

1. **Email Settings** ⚠️
   - Sender email
   - Notification preferences
   - Admin recipients
   
2. **Invoice Settings Completi** ⚠️
   - Numerazione progressiva
   - Default IVA
   - PDF branding
   
3. **VAT Rates Management** ⚠️
   - Default IVA
   - Split payment
   
4. **Regional Settings** ⚠️
   - Timezone
   - Formato data/ora
   - Valuta

**Tempo stimato**: 8-10 ore

---

### ⚡ PRIORITÀ ALTA (Post Go-Live Immediato)

5. **Customer Settings**
   - Campi obbligatori
   - GDPR retention
   
6. **Subscription Settings**
   - Regole sospensione
   - Notifiche scadenza
   
7. **Medical Cert Settings**
   - Obbligatorietà
   - Validità predefinita
   
8. **Branding Settings**
   - Logo upload
   - Colori brand

**Tempo stimato**: 6-8 ore

---

### 📝 PRIORITÀ MEDIA (Settimana 2-3)

9. **Document Types Settings**
10. **Measurement Settings**
11. **Sports Registration Settings**
12. **Business Hours**
13. **Security Settings**

**Tempo stimato**: 10-12 ore

---

### 🎯 PRIORITÀ BASSA (Enhancements)

14. **Booking Settings** (se implementato)
15. **Loyalty Settings** (futuro)
16. **Integration Settings**
17. **Data Retention avanzato**

**Tempo stimato**: 15-20 ore

---

## 🎯 PROPOSTA ARCHITETTURA

### Gruppi Settings Logici

```php
// Group: general
'general.company_name'
'general.language'
'general.timezone'
'general.currency'

// Group: email
'email.sender'
'email.reply_to'
'email.signature'
'email.admin_recipients'

// Group: notifications
'notifications.invoice_accepted'
'notifications.invoice_rejected'
'notifications.customer_created'
'notifications.subscription_expiring'

// Group: invoice
'invoice.progressive_number_format'
'invoice.progressive_number_start'
'invoice.progressive_number_prefix'
'invoice.default_vat_rate'
'invoice.default_payment_terms'
'invoice.stamp_duty.charge_customer'
'invoice.stamp_duty.amount'
'invoice.stamp_duty.threshold'

// Group: customer
'customer.require_tax_code'
'customer.require_email'
'customer.require_phone'
'customer.gdpr_retention_years'

// Group: subscription
'subscription.grace_period_days'
'subscription.expiring_notice_days'
'subscription.auto_renew'

// Group: medical
'medical.required_for_subscription'
'medical.validity_months'
'medical.remind_before_days'

// Group: branding
'branding.logo_path'
'branding.primary_color'
'branding.secondary_color'

// Group: security
'security.require_2fa'
'security.session_timeout'
'security.password_min_length'
```

---

## 🎨 UI/UX PROPOSTA

### Menu Configurazioni

```
Configurazioni
├── 📋 Generale
│   ├── Azienda (Dati fiscali)
│   ├── Sedi operative
│   └── Localizzazione
│
├── 💰 Fatturazione
│   ├── Impostazioni fattura
│   ├── IVA e tasse
│   ├── Metodi di pagamento
│   └── Numerazione documenti
│
├── 📧 Email & Notifiche
│   ├── Configurazione email
│   ├── Preferenze notifiche
│   └── Destinatari
│
├── 👥 Clienti
│   ├── Campi obbligatori
│   ├── Privacy & GDPR
│   └── Area cliente
│
├── 🏋️ Abbonamenti & Servizi
│   ├── Regole abbonamenti
│   ├── Certificati medici
│   ├── Tesseramenti
│   └── Misurazioni
│
├── 🎨 Brand & Design
│   ├── Logo e colori
│   ├── Template email
│   └── PDF personalizzati
│
├── 🔒 Sicurezza
│   ├── Autenticazione
│   ├── Session
│   └── Audit log
│
└── 🔌 Integrazioni
    ├── Google Calendar
    ├── WhatsApp Business
    └── Altri servizi
```

---

## 📊 STATISTICHE

**Totale Settings Identificati**: ~100+
**Gruppi Logici**: 10-12
**Pagine UI Necessarie**: 15-20
**Tempo Implementazione Completa**: 40-50 ore
**Priorità Massima**: 8-10 ore (25%)

---

## 🚀 NEXT STEPS

### Fase 1: Setup Essenziale (8-10h)
1. Email Settings complete
2. Invoice Settings complete
3. VAT Management
4. Regional Settings

### Fase 2: Business Logic (6-8h)
5. Customer Settings
6. Subscription Settings
7. Medical Cert Settings
8. Branding Settings

### Fase 3: Advanced (10-12h)
9-13. Document Types, Measurement, Security, etc.

### Fase 4: Integrations (15-20h)
14-17. Booking, Loyalty, External APIs

---

**TOTALE CONFIGURAZIONI DA IMPLEMENTARE**: ~100 settings
**TEMPO TOTALE STIMATO**: 40-50 ore
**TEMPO CRITICO PRE GO-LIVE**: 8-10 ore

---

*Analisi completata: 13 Gennaio 2025*  
*Prossimo step: Implementazione Fase 1 (Email + Invoice + VAT + Regional)*


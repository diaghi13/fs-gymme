# 📋 SETTINGS SYSTEM - RACCOMANDAZIONI & ROADMAP
**Data**: 13 Gennaio 2025  
**Analisi Completa**: `SETTINGS_COMPLETE_ANALYSIS.md`

---

## 🎯 EXECUTIVE SUMMARY

### Stato Attuale
✅ **Sistema Base**: TenantSetting model funzionante con cache  
✅ **4 Pagine Config**: Company, Structure, Financial Resources, Invoice (parziale)  
⚠️ **Missing**: ~100 settings critici per operatività completa

### Priorità Go-Live
**CRITICO (8-10h)**: 4 aree mancanti essenziali  
**ALTO (6-8h)**: 4 aree business logic  
**MEDIO (10-12h)**: 5 aree advanced features  

---

## 🔥 SETTINGS CRITICI MANCANTI (Pre Go-Live)

### 1. EMAIL SETTINGS ⚠️ **CRITICO**

**Perché Critico**: Senza questo, le email FE non hanno sender corretto

**Settings Necessari**:
```php
// Group: email
'email.sender'           // Default: tenant.email
'email.sender_name'      // Default: tenant.name
'email.reply_to'         // Dove rispondono i clienti
'email.signature'        // Firma automatica email
'email.admin_recipients' // JSON array admin emails

// Esempio:
TenantSetting::set('email.sender', 'noreply@palestratest.it', 'email');
TenantSetting::set('email.reply_to', 'info@palestratest.it', 'email');
TenantSetting::set('email.admin_recipients', json_encode([
    'admin@palestratest.it',
    'contabilita@palestratest.it'
]), 'email');
```

**Impatto**: Email notifications FE + tutte le altre email sistema

**Tempo**: 2-3h

---

### 2. INVOICE SETTINGS COMPLETI ⚠️ **CRITICO**

**Perché Critico**: Numerazione fatture, default IVA

**Settings Mancanti**:
```php
// Numerazione
'invoice.progressive_format'        // es: "FT-{year}-{number}"
'invoice.progressive_start'         // es: 1
'invoice.progressive_prefix'        // es: "FT-"
'invoice.reset_yearly'              // true/false

// Defaults
'invoice.default_vat_rate_id'       // FK vat_rates
'invoice.default_payment_terms'     // es: 30 giorni
'invoice.default_payment_method_id' // FK financial_resources
'invoice.default_notes'             // Note predefinite

// PDF
'invoice.pdf_logo_path'             // Path logo
'invoice.pdf_footer'                // Footer PDF
'invoice.pdf_show_stamp'            // Mostra bollo nel PDF

// GIÀ IMPLEMENTATO ✅
'invoice.stamp_duty.charge_customer'
'invoice.stamp_duty.amount'
'invoice.stamp_duty.threshold'
```

**Impatto**: Fatturazione funzionale

**Tempo**: 3-4h

---

### 3. VAT MANAGEMENT ⚠️ **CRITICO**

**Perché Critico**: Default IVA per tutte le vendite

**Settings Necessari**:
```php
// Group: vat
'vat.default_sales_rate_id'        // IVA predefinita vendite
'vat.default_purchase_rate_id'     // IVA predefinita acquisti
'vat.split_payment_enabled'        // true/false
'vat.reverse_charge_enabled'       // true/false

// Natura IVA esenzioni (per FE)
'vat.exempt_nature_n1'              // Escluse ex art.15
'vat.exempt_nature_n2'              // Non soggette
// ... N3-N7
```

**Impatto**: Vendite e fatturazione elettronica

**Tempo**: 2-3h

---

### 4. REGIONAL SETTINGS ⚠️ **CRITICO**

**Perché Critico**: Formato date, timezone, valuta

**Settings Necessari**:
```php
// Group: regional
'regional.language'                 // it, en, es, fr
'regional.timezone'                 // Europe/Rome
'regional.date_format'              // d/m/Y
'regional.time_format'              // H:i (24h)
'regional.currency'                 // EUR
'regional.decimal_separator'        // ,
'regional.thousands_separator'      // .
```

**Impatto**: UI, PDF, Email formatting

**Tempo**: 1-2h

---

## ⚡ SETTINGS ALTA PRIORITÀ (Post Go-Live)

### 5. CUSTOMER SETTINGS

```php
// Group: customer
'customer.require_tax_code'         // true/false
'customer.require_email'            // true/false
'customer.require_phone'            // true/false
'customer.require_address'          // true/false
'customer.gdpr_retention_years'     // es: 10
'customer.auto_delete_inactive_days' // es: 1825 (5 anni)
```

**Tempo**: 2h

---

### 6. SUBSCRIPTION SETTINGS

```php
// Group: subscription
'subscription.grace_period_days'    // es: 7
'subscription.expiring_notice_days' // es: 30
'subscription.auto_suspend_days'    // es: 15
'subscription.auto_renew'           // true/false
'subscription.prorata_enabled'      // true/false
```

**Tempo**: 2h

---

### 7. MEDICAL CERTIFICATION SETTINGS

```php
// Group: medical
'medical.required_for_subscription' // true/false
'medical.validity_months_agonistic' // es: 12
'medical.validity_months_non_agonistic' // es: 12
'medical.remind_before_days'        // es: 30
'medical.block_without_cert'        // true/false
```

**Tempo**: 1h

---

### 8. BRANDING SETTINGS

```php
// Group: branding
'branding.logo_path'                // Path storage
'branding.primary_color'            // #FF5733
'branding.secondary_color'          // #33FF57
'branding.font_family'              // 'Arial, sans-serif'
'branding.tagline'                  // Slogan aziendale
```

**Tempo**: 2h

---

## 🎨 IMPLEMENTAZIONE PROPOSTA

### Struttura Pagine UI

```
/configurations
├── /general                        # Tab 1: Generale
│   ├── company                     # Sottopagina: Azienda
│   ├── structures                  # Sottopagina: Sedi
│   └── regional                    # Sottopagina: Localizzazione (NEW)
│
├── /billing                        # Tab 2: Fatturazione
│   ├── invoice-settings            # Sottopagina: Impostazioni (UPGRADE)
│   ├── vat-rates                   # Sottopagina: IVA (NEW)
│   ├── payment-methods             # Sottopagina: Metodi pagamento (già esiste)
│   └── numbering                   # Sottopagina: Numerazione (NEW)
│
├── /communications                 # Tab 3: Comunicazioni (NEW)
│   ├── email-settings              # Sottopagina: Email (NEW)
│   ├── notifications               # Sottopagina: Notifiche (NEW)
│   └── templates                   # Sottopagina: Template (futuro)
│
├── /customers                      # Tab 4: Clienti (NEW)
│   ├── required-fields             # Sottopagina: Campi obbligatori
│   ├── gdpr                        # Sottopagina: Privacy
│   └── portal                      # Sottopagina: Area cliente (futuro)
│
├── /services                       # Tab 5: Servizi (NEW)
│   ├── subscriptions               # Sottopagina: Abbonamenti
│   ├── medical-certs               # Sottopagina: Certificati
│   ├── sports-registration         # Sottopagina: Tesseramenti
│   └── measurements                # Sottopagina: Misurazioni
│
├── /brand                          # Tab 6: Brand (NEW)
│   ├── logo-colors                 # Sottopagina: Logo & Colori
│   ├── email-templates             # Sottopagina: Template email
│   └── pdf-customization           # Sottopagina: PDF
│
└── /advanced                       # Tab 7: Avanzate (futuro)
    ├── security                    # Sottopagina: Sicurezza
    ├── integrations                # Sottopagina: Integrazioni
    └── data-retention              # Sottopagina: Conservazione
```

---

## 🚀 ROADMAP IMPLEMENTAZIONE

### Phase 1: CRITICO (Pre Go-Live) - 8-10h

**Settimana 1 - Giorni 1-2**

#### Giorno 1 (5h)
- [x] Analisi completa (fatto)
- [ ] Email Settings page (2h)
  - Form email sender/reply-to
  - Admin recipients management
  - Email signature editor
- [ ] Regional Settings page (1h)
  - Language selector
  - Timezone selector
  - Format preferences

#### Giorno 2 (5h)
- [ ] Invoice Settings UPGRADE (3h)
  - Progressive numbering
  - Default values (IVA, payment terms)
  - PDF settings
- [ ] VAT Management page (2h)
  - Default VAT rates selector
  - Split payment toggle
  - Natura IVA mappings

**Output Phase 1**: Sistema operativo completo ✅

---

### Phase 2: ALTA PRIORITÀ (Settimana 2) - 6-8h

**Settimana 2 - Giorni 3-4**

#### Giorno 3 (4h)
- [ ] Customer Settings page (2h)
- [ ] Subscription Settings page (2h)

#### Giorno 4 (4h)
- [ ] Medical Cert Settings page (1h)
- [ ] Branding Settings page (2h)
  - Logo upload
  - Color pickers
  - Preview live
- [ ] Testing & polish (1h)

**Output Phase 2**: Business logic configurabile ✅

---

### Phase 3: MEDIO (Settimana 3-4) - 10-12h

**Features**:
- [ ] Document Types Settings
- [ ] Measurement Settings
- [ ] Sports Registration Settings
- [ ] Business Hours Management
- [ ] Security Settings (2FA, password policy)

**Output Phase 3**: Sistema advanced completo ✅

---

### Phase 4: ENHANCEMENTS (Futuro) - 15-20h

**Features**:
- [ ] Booking Settings (se implementato)
- [ ] Loyalty Program Settings
- [ ] Integration Settings (Google, WhatsApp, etc.)
- [ ] Advanced Data Retention
- [ ] Multi-language UI

**Output Phase 4**: Enterprise-grade features ✅

---

## 📊 STIMA TEMPI & COSTI

| Phase | Features | Tempo | Priorità |
|-------|----------|-------|----------|
| **Phase 1** | Email + Invoice + VAT + Regional | 8-10h | 🔥 CRITICO |
| **Phase 2** | Customer + Sub + Medical + Brand | 6-8h | ⚡ ALTA |
| **Phase 3** | Document + Security + Advanced | 10-12h | 📝 MEDIA |
| **Phase 4** | Booking + Loyalty + Integrations | 15-20h | 🎯 BASSA |

**TOTALE**: 40-50 ore per sistema completo

**GO-LIVE MINIMO**: Phase 1 (8-10h) ✅

---

## 🎯 RACCOMANDAZIONI

### Per Go-Live (3 giorni)
**FOCUS**: Phase 1 solo (8-10h)
- Email Settings
- Invoice Settings completi
- VAT Management
- Regional Settings

**Perché**: Sistema operativo minimo funzionale

---

### Per Sistema Robusto (1-2 settimane)
**FOCUS**: Phase 1 + Phase 2 (15-18h)
- Tutte le configurazioni critiche
- Business logic configurabile
- Branding personalizzabile

**Perché**: Sistema professionale completo

---

### Per Sistema Enterprise (1 mese)
**FOCUS**: All Phases (40-50h)
- Ogni aspetto configurabile
- Security advanced
- Integrations esterne

**Perché**: Massima flessibilità tenant

---

## 💡 SUGGERIMENTI IMPLEMENTAZIONE

### 1. Component Riutilizzabili
```tsx
// SettingCard.tsx - Card standard per un setting
// SettingToggle.tsx - Toggle on/off
// SettingInput.tsx - Input con label + help
// SettingColorPicker.tsx - Color picker
// SettingFileUpload.tsx - Upload file (logo)
// SettingSelect.tsx - Dropdown opzioni
```

### 2. Hook Utilities
```tsx
// useTenantSetting.ts - Hook per get/set settings
const { value, setValue, loading } = useTenantSetting('email.sender');

// useSettingsGroup.ts - Hook per gruppo settings
const { settings, update, loading } = useSettingsGroup('email');
```

### 3. Validation
```php
// app/Http/Requests/Settings/UpdateEmailSettingsRequest.php
// Validation rules per ogni gruppo settings
```

### 4. Seeder
```php
// database/seeders/DefaultTenantSettingsSeeder.php
// Popola settings default per nuovo tenant
```

---

## 📋 CHECKLIST PRE-IMPLEMENTAZIONE

### Backend
- [x] TenantSetting model exists ✅
- [x] Migration exists ✅
- [x] Seeder exists ✅
- [ ] Validation Requests (to create)
- [ ] API endpoints (to create)

### Frontend
- [x] Configuration pages structure ✅
- [ ] Settings components (to create)
- [ ] TypeScript types (to create)
- [ ] API integration (to update)

### Documentation
- [x] Analysis complete ✅
- [ ] Implementation guide (to create)
- [ ] User manual (to create)

---

## 🎊 CONCLUSIONE

### Sistema Settings
**Stato**: ⚠️ Base implementato, manca ~80% funzionalità

### Priorità Immediata
**Phase 1** (8-10h): Email + Invoice + VAT + Regional

### Valore Business
**ALTO**: Ogni tenant può personalizzare completamente il sistema

### ROI
**ECCELLENTE**: 40-50h investimento per sistema enterprise-grade

---

**Prossimo Step**: Implementare Phase 1 (8-10h) prima del go-live

---

*Documento generato: 13 Gennaio 2025*  
*Analisi completa: SETTINGS_COMPLETE_ANALYSIS.md*  
*Prossima revisione: Dopo Phase 1*


# 🌍 Regional Settings - Sistema di Localizzazione

## ✅ IMPLEMENTATO

### 1. Backend Configuration
- ✅ `tenant_settings` table nel database tenant (NON nel centrale)
- ✅ 34 settings configurabili tramite UI
- ✅ Settings condivisi automaticamente via `HandleInertiaRequests` middleware
- ✅ Disponibili come `props.regional_settings` in ogni pagina Inertia

### 2. Settings Disponibili

#### Regional Settings (Localizzazione)
```typescript
{
  language: 'it',              // Lingua interfaccia
  timezone: 'Europe/Rome',     // Fuso orario
  date_format: 'd/m/Y',        // Formato date (PHP format)
  time_format: 'H:i',          // Formato ora (PHP format)
  currency: 'EUR',             // Valuta
  decimal_separator: ',',      // Separatore decimali
  thousands_separator: '.'     // Separatore migliaia
}
```

#### Email Settings
- sender, sender_name, reply_to, signature, admin_recipients

#### Notifications
- invoice_accepted, invoice_rejected, customer_created, etc.

#### VAT Settings
- default_sales_rate_id, split_payment_enabled, exempt_nature_n1-n7, etc.

#### Invoice Settings
- stamp_duty.charge_customer, stamp_duty.amount, stamp_duty.threshold

### 3. React Hooks Disponibili

```typescript
import {
  useRegionalSettings,
  useFormatCurrency,
  useFormatNumber,
  useDateFormat,
  useDateTimeFormat
} from '@/hooks/useRegionalSettings';

// Esempio: Formattare una valuta
function PriceComponent() {
  const formatCurrency = useFormatCurrency();
  return <span>{formatCurrency(1234.56)}</span>; // "1.234,56 €"
}

// Esempio: Formattare una data
function DateComponent() {
  const dateFormat = useDateFormat();
  return <span>{format(new Date(), dateFormat)}</span>; // "18/11/2025"
}

// Esempio: Formattare un numero
function NumberComponent() {
  const formatNumber = useFormatNumber();
  return <span>{formatNumber(1234.56, 2)}</span>; // "1.234,56"
}
```

### 4. React Components Disponibili

```typescript
import FormattedCurrency from '@/components/ui/FormattedCurrency';
import FormattedDate from '@/components/ui/FormattedDate';
import FormattedNumber from '@/components/ui/FormattedNumber';

// Uso semplice
<FormattedCurrency value={1234.56} />           // "1.234,56 €"
<FormattedDate value={new Date()} />            // "18/11/2025"
<FormattedDate value={new Date()} showTime />   // "18/11/2025 14:30"
<FormattedNumber value={1234.56} decimals={2} /> // "1.234,56"
```

### 5. Utility Functions

```typescript
import { formatCurrency, formatNumber, phpToDateFnsFormat } from '@/support/formatters';
import { RegionalSettings } from '@/types';

// Se hai accesso alle settings, puoi usare le utility direttamente
const settings: RegionalSettings = {...};
const formatted = formatCurrency(1234.56, settings, true);
```

## 📋 MIGRAZIONE DEI COMPONENTI ESISTENTI

### File da Aggiornare (27 totali)

I seguenti file utilizzano formattazioni hardcoded e dovrebbero essere aggiornati:

#### Componenti Clienti
- `components/customers/cards/DetailsCard.tsx`
- `components/customers/tabs/ExtensionsTab.tsx`
- `components/customers/dialogs/AddExtensionDialog.tsx`
- `components/customers/SubscriptionItem.tsx`
- `components/customers/tabs/SalesTab.tsx`
- `components/customers/cards/MembershipFeeCard.tsx`
- `components/customers/cards/SportsRegistrationCard.tsx`
- `components/customers/dialogs/ViewMembershipFeeDialog.tsx`
- `components/customers/ActivityTimeline.tsx`
- `components/customers/tabs/MeasurementsTab.tsx`
- `components/customers/tabs/DocumentsTab.tsx`
- `components/customers/Table/SaleRow.tsx`
- `components/customers/Table/PaymentRow.tsx`
- `components/customers/cards/MembershipCardCard.tsx`
- `components/customers/cards/MedicalCertificationCard.tsx`

#### Componenti Vendite
- `pages/sales/sale-show.tsx`
- `pages/sales/sale-index.tsx`
- `components/sales/ElectronicInvoiceTimeline.tsx`
- `components/sales/ElectronicInvoiceCard.tsx`
- `components/sales/cards/SaleElectronicInvoiceStatusCard.tsx`
- `components/sales/cards/SaleHeaderCard.tsx`
- `components/sales/cards/SalePaymentsCard.tsx`
- `components/sales/SummaryTab.tsx`

#### Altri Componenti
- `components/dashboard/ElectronicInvoiceWidget.tsx`
- `pages/configurations/regional-settings.tsx`
- `components/price-list/subscription/SaleForm.tsx`

### Pattern da Sostituire

#### 1. Formattazione Valuta Hardcoded
```typescript
// ❌ PRIMA (hardcoded)
const formatted = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
}).format(amount);

// ✅ DOPO (con hook)
const formatCurrency = useFormatCurrency();
const formatted = formatCurrency(amount);

// ✅ OPPURE (con component)
<FormattedCurrency value={amount} />
```

#### 2. Formattazione Date Hardcoded
```typescript
// ❌ PRIMA (hardcoded)
format(date, 'dd/MM/yyyy')

// ✅ DOPO (con hook)
const dateFormat = useDateFormat();
format(date, dateFormat)

// ✅ OPPURE (con component)
<FormattedDate value={date} />
```

#### 3. Formattazione Numeri Hardcoded
```typescript
// ❌ PRIMA (hardcoded)
(amount / 100).toLocaleString('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// ✅ DOPO (con hook)
const formatNumber = useFormatNumber();
formatNumber(amount / 100, 2)

// ✅ OPPURE (con component)
<FormattedNumber value={amount / 100} decimals={2} />
```

## 🚀 BENEFICI

1. **Flessibilità**: Ogni tenant può configurare i propri formati
2. **Internazionalizzazione**: Supporto multi-lingua/multi-valuta ready
3. **Manutenibilità**: Un unico punto di configurazione
4. **Coerenza**: Formati uniformi in tutta l'applicazione
5. **Testabilità**: Facile testare con diverse configurazioni regionali

## 📝 TODO - MIGRAZIONE COMPONENTI

Per ogni file identificato:

1. **Importare gli hook necessari**
   ```typescript
   import { useFormatCurrency, useDateFormat } from '@/hooks/useRegionalSettings';
   ```

2. **Chiamare gli hook all'inizio del component**
   ```typescript
   const formatCurrency = useFormatCurrency();
   const dateFormat = useDateFormat();
   ```

3. **Sostituire le formattazioni hardcoded**
   - Cercare `toLocaleString('it-IT'` → sostituire con `formatCurrency()`
   - Cercare `NumberFormat('it-IT'` → sostituire con `formatNumber()`
   - Cercare `format(date, 'dd/MM/yyyy'` → sostituire con `format(date, dateFormat)`

4. **O usare i componenti wrapper**
   ```typescript
   <FormattedCurrency value={amount} />
   <FormattedDate value={date} />
   ```

## 🎯 STATO ATTUALE

- ✅ Infrastruttura completa
- ✅ Hooks funzionanti
- ✅ Componenti wrapper creati
- ✅ CartSidebar aggiornato (esempio di migrazione)
- ⏳ 26 componenti da aggiornare

## 🔄 PROSSIMI PASSI

1. Aggiornare tutti i 27 componenti identificati
2. Testare che le configurazioni funzionino correttamente
3. Verificare formati in PDF e email
4. Documentare eventuali edge cases

---

**Data Implementazione**: 18 Novembre 2025
**Stato**: ✅ Sistema Pronto - In corso migrazione componenti
